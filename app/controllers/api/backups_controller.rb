# app/controllers/api/backups_controller.rb
require 'google/apis/drive_v3'
require 'googleauth'
require 'yaml'

class Api::BackupsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:upload_to_drive, :set_folder_id]

  CONFIG_PATH = Rails.root.join('config', 'google_drive_config.yml')

  def index
    backup_dir = Rails.root.join('db', 'backups')
    Dir.mkdir(backup_dir) unless Dir.exist?(backup_dir)
    backups = Dir.glob(backup_dir.join('db_data_*.sql')).sort.reverse.map do |file|
      date = File.basename(file)[8..17] # "YYYY-MM-DD"
      {
        date: date,
        filename: File.basename(file),
        url: "/backups/#{File.basename(file)}"
      }
    end
    render json: { backups: backups }
  end

  def folder_id
    folder_id = read_folder_id
    render json: { folder_id: folder_id }
  end

  def set_folder_id
    data = JSON.parse(request.body.read) rescue {}
    folder_id = data['folder_id']
    if folder_id.present?
      File.write(CONFIG_PATH, { 'folder_id' => folder_id }.to_yaml)
      Rails.application.config.google_drive_folder_id = folder_id
      render json: { success: true, folder_id: folder_id }
    else
      render json: { error: 'Invalid folder_id' }, status: :unprocessable_entity
    end
  end

  def upload_to_drive
    backup_dir = Rails.root.join('db', 'backups')
    latest_backup = Dir.glob(backup_dir.join('db_data_*.sql')).sort.reverse.first
    unless latest_backup && File.exist?(latest_backup)
      render json: { error: 'No backup file found' }, status: :not_found and return
    end

    # Google Drive API setup
    drive_service = Google::Apis::DriveV3::DriveService.new
    drive_service.client_options.application_name = 'DailyPay Backup Upload'
    credentials_path = ENV['GOOGLE_DRIVE_CREDENTIALS'] || Rails.root.join('config', 'google_drive_service_account.json')
    drive_service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: ['https://www.googleapis.com/auth/drive.file']
    )

    # Get Google Drive folder ID from config or ENV
    folder_id = read_folder_id
    file_metadata = { name: File.basename(latest_backup) }
    file_metadata[:parents] = [folder_id] if folder_id.present?
    file = drive_service.create_file(
      file_metadata,
      upload_source: latest_backup,
      content_type: 'application/sql'
    )
    render json: { success: true, file_id: file.id, file_name: file.name }
  rescue => e
    render json: { error: e.message }, status: :internal_server_error
  end

  private

  def read_folder_id
    if File.exist?(CONFIG_PATH)
      config = YAML.load_file(CONFIG_PATH)
      config['folder_id']
    else
      Rails.application.config.google_drive_folder_id
    end
  end
end
