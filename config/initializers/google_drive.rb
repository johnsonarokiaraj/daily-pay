# config/initializers/google_drive.rb
# Set the Google Drive folder ID for backup uploads
Rails.application.config.google_drive_folder_id = ENV['GOOGLE_DRIVE_FOLDER_ID'] || '15jKXzaXTUQoQS02qLWYarHIDoQwxu0BT'

# Set the Google Drive Shared Drive ID for backup uploads
Rails.application.config.google_drive_shared_drive_id = ENV['GOOGLE_DRIVE_SHARED_DRIVE_ID']
