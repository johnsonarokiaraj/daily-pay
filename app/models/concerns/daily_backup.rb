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

    # Detect if using SQLite and use the correct backup command
    config = ActiveRecord::Base.connection_db_config.configuration_hash
    if config[:adapter] == 'sqlite3'
      db_path = config[:database]
      cmd = "sqlite3 #{db_path} .dump > #{backup_file}"
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
    if all_backups.size > 2
      all_backups[2..-1].each { |old_file| File.delete(old_file) }
    end
  end
end
