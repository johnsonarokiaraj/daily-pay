# config/initializers/google_drive.rb
# Set the Google Drive folder ID for backup uploads
Rails.application.config.google_drive_folder_id = ENV['GOOGLE_DRIVE_FOLDER_ID'] || '15jKXzaXTUQoQS02qLWYarHIDoQwxu0BT'
