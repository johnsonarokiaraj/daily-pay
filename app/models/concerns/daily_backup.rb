# app/models/concerns/daily_backup.rb
require 'fileutils'

module DailyBackup
  extend ActiveSupport::Concern

  included do
    after_create :create_daily_backup_if_needed
  end

  def create_daily_backup_if_needed
    today = Date.today.strftime('%Y-%m-%d')
    backup_dir = Rails.root.join('db', 'backups')
    FileUtils.mkdir_p(backup_dir)
    backup_file = backup_dir.join("db_data_#{today}.sql")
    return if File.exist?(backup_file)

    # Detect database adapter and use the correct backup command
    config = ActiveRecord::Base.connection_db_config.configuration_hash
    case config[:adapter]
    when 'sqlite3'
      db_path = config[:database]
      cmd = "sqlite3 #{db_path} .dump > #{backup_file}"
      system(cmd)
    when 'mysql2'
      # Use mysqldump for MySQL
      db = config[:database]
      user = config[:username]
      host = config[:host] || 'localhost'
      password = config[:password]
      port = config[:port] || 3306

      # Build mysqldump command
      cmd_parts = ["mysqldump"]
      cmd_parts << "-h #{host}"
      cmd_parts << "-P #{port}"
      cmd_parts << "-u #{user}" if user
      cmd_parts << "-p#{password}" if password && !password.empty?
      cmd_parts << "--single-transaction"
      cmd_parts << "--routines"
      cmd_parts << "--triggers"
      cmd_parts << db
      cmd_parts << "> #{backup_file}"

      cmd = cmd_parts.join(' ')
      system(cmd)
    else
      # Use pg_dump for PostgreSQL, adjust for your DB if needed
      db = config[:database]
      user = config[:username]
      host = config[:host] || 'localhost'
      password = config[:password]
      ENV['PGPASSWORD'] = password if password
      cmd = "pg_dump -U #{user} -h #{host} #{db} > #{backup_file}"
      system(cmd)
      ENV['PGPASSWORD'] = nil
    end

    # Remove old backups, keep only the latest two
    all_backups = Dir.glob(backup_dir.join('db_data_*.sql')).sort.reverse
    if all_backups.size > 10
      all_backups[10..-1].each { |old_file| File.delete(old_file) }
    end

    # Automatically upload the new backup to Google Drive
    if File.exist?(backup_file)
      20.times do
        break if File.size?(backup_file).to_i > 0
        sleep 0.1
      end
      upload_backup_to_google_drive(backup_file) if File.size?(backup_file).to_i > 0
    end
  end

  def upload_backup_to_google_drive(backup_file)
    require 'google/apis/drive_v3'
    require 'googleauth'
    require 'yaml'

    # Google Drive API setup
    drive_service = Google::Apis::DriveV3::DriveService.new
    drive_service.client_options.application_name = 'DailyPay Backup Upload'
    credentials_path = ENV['GOOGLE_DRIVE_CREDENTIALS'] || Rails.root.join('config', 'google_drive_service_account.json')
    drive_service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: ['https://www.googleapis.com/auth/drive.file']
    )

    # Get Google Drive folder and shared drive IDs from config or ENV
    config_path = Rails.root.join('config', 'google_drive_config.yml')
    folder_id = nil
    shared_drive_id = nil
    if File.exist?(config_path)
      config = YAML.load_file(config_path)
      folder_id = config['folder_id']
      shared_drive_id = config['shared_drive_id']
    else
      folder_id = Rails.application.config.google_drive_folder_id
      shared_drive_id = Rails.application.config.google_drive_shared_drive_id
    end

    file_metadata = { name: File.basename(backup_file) }
    file_metadata[:parents] = [folder_id] if folder_id.present?

    # Use supportsAllDrives and shared driveId if provided
    drive_service.create_file(
      file_metadata,
      upload_source: backup_file,
      content_type: 'application/sql',
      supports_all_drives: true,
      fields: 'id',
      drive_id: shared_drive_id
    )
  rescue => e
    Rails.logger.error("Google Drive upload failed: #{e.message}")
  end
end
