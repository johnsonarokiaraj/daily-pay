module Api
  class TagInsightsBoardsController < ApplicationController
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

    private

    def board_params
      params.require(:tag_insights_board_record).permit(:main_tag, sub_tags: [])
    end
  end
end

