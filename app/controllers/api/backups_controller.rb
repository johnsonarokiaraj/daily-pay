# app/controllers/api/backups_controller.rb
class Api::BackupsController < ApplicationController

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
end
