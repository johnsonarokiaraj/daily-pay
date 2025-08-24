module Api
  class TagInsightsBoardsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
      @boards = TagInsightsBoardRecord.all
      # Calculate financial data for each board
      @boards_with_financials = @boards.map do |board|
        insights = TagInsightsBoard.new(board.main_tag, JSON.parse(board.sub_tags.to_json))
        flattened = insights.flattened_view
        main_tag_data = flattened.find { |row| row[:type] == :main_tag }
  
        board_data = {
          board: board,
          credit_sum: main_tag_data ? main_tag_data[:credit_sum] : 0,
          debit_sum: main_tag_data ? main_tag_data[:debit_sum] : 0,
          balance: main_tag_data ? main_tag_data[:sum] : 0,
        }
        board_data
      end
      render json: @boards_with_financials
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
