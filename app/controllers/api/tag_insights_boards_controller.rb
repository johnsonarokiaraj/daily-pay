module Api
  class TagInsightsBoardsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
      boards = TagInsightsBoardRecord.all
      render json: boards
    end

    def show
      board = TagInsightsBoardRecord.find(params[:id])
      insights = TagInsightsBoard.new(board.main_tag, board.sub_tags)
      flattened = insights.flattened_view
      render json: { board: board, flattened: flattened }
    end

    def create
      board = TagInsightsBoardRecord.new(board_params)
      if board.save
        render json: board, status: :created
      else
        render json: board.errors, status: :unprocessable_entity
      end
    end

    def update
      board = TagInsightsBoardRecord.find(params[:id])

      # Debug logging to see what parameters we're receiving
      Rails.logger.debug "Received params: #{params.inspect}"
      Rails.logger.debug "Board params: #{board_params.inspect}"

      if board.update(board_params)
        render json: board
      else
        Rails.logger.error "Board update errors: #{board.errors.full_messages}"
        render json: { errors: board.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def board_params
      params.require(:tag_insights_board).permit(:name, :main_tag, sub_tags: [])
    end
  end
end
