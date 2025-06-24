class TagInsightsBoardsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create, :update]

  def index
    @boards = TagInsightsBoardRecord.all
    respond_to do |format|
      format.html # renders default view
      format.json { render json: @boards }
    end
  end

  def show
    @board = TagInsightsBoardRecord.find(params[:id])
    @insights = TagInsightsBoard.new(@board.main_tag, @board.sub_tags)
    @flattened = @insights.flattened_view
    respond_to do |format|
      format.html # renders default view
      format.json { render json: { board: @board, flattened: @flattened } }
    end
  end

  def new
    @board = TagInsightsBoardRecord.new
  end

  def create
    Rails.logger.info "DEBUG: Received params:"
    Rails.logger.info params.inspect
    @board = TagInsightsBoardRecord.new(board_params)
    if @board.save
      respond_to do |format|
        format.html { redirect_to tag_insights_boards_path, notice: 'Board created!' }
        format.json { render json: @board, status: :created }
      end
    else
      Rails.logger.info "DEBUG: Board errors:"
      Rails.logger.info @board.errors.full_messages.inspect
      respond_to do |format|
        format.html { render :new }
        format.json { render json: @board.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @board = TagInsightsBoardRecord.find(params[:id])
  end

  def update
    Rails.logger.info "DEBUG: Update params:"
    Rails.logger.info params.inspect
    @board = TagInsightsBoardRecord.find(params[:id])
    if @board.update(board_params)
      respond_to do |format|
        format.html { redirect_to tag_insights_board_path(@board), notice: 'Board updated!' }
        format.json { render json: @board, status: :ok }
      end
    else
      Rails.logger.info "DEBUG: Update errors:"
      Rails.logger.info @board.errors.full_messages.inspect
      respond_to do |format|
        format.html { render :edit }
        format.json { render json: @board.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def board_params
    params.require(:tag_insights_board_record).permit(:name, :main_tag, sub_tags: [])
  end
end
