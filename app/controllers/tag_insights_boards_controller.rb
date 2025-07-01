class TagInsightsBoardsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create, :update]
  layout 'application'

  # Define a before_action to set a flag for JavaScript to show the sidebar
  before_action :set_full_layout_flag, only: [:index]  # Remove :show from here

  # Helper method to format numbers in Indian style
  def format_indian_currency(amount)
    return "₹0.00" if amount.nil? || amount == 0

    # Convert to float and handle negative numbers
    num = amount.to_f
    is_negative = num < 0
    num = num.abs

    # Format to 2 decimal places
    formatted = "%.2f" % num
    integer_part, decimal_part = formatted.split('.')

    # Apply Indian number formatting (lakhs, crores)
    if integer_part.length > 3
      # Add commas for Indian number system
      # First comma after 3 digits from right, then every 2 digits
      reversed = integer_part.reverse
      formatted_reversed = ""

      reversed.chars.each_with_index do |char, index|
        formatted_reversed += char
        if index == 2 && reversed.length > 3
          formatted_reversed += ","
        elsif index > 2 && (index - 2) % 2 == 0 && index < reversed.length - 1
          formatted_reversed += ","
        end
      end

      integer_part = formatted_reversed.reverse
    end

    result = "₹#{integer_part}.#{decimal_part}"
    result = "-#{result}" if is_negative
    result
  end

  def index
    @boards = TagInsightsBoardRecord.all
    # Calculate financial data for each board
    @boards_with_financials = @boards.map do |board|
      insights = TagInsightsBoard.new(board.main_tag, board.sub_tags)
      flattened = insights.flattened_view
      main_tag_data = flattened.find { |row| row[:type] == :main_tag }

      board_data = {
        board: board,
        credit_sum: main_tag_data ? main_tag_data[:credit_sum] : 0,
        debit_sum: main_tag_data ? main_tag_data[:debit_sum] : 0,
        balance: main_tag_data ? main_tag_data[:sum] : 0,
        # Add formatted versions
        credit_sum_formatted: format_indian_currency(main_tag_data ? main_tag_data[:credit_sum] : 0),
        debit_sum_formatted: format_indian_currency(main_tag_data ? main_tag_data[:debit_sum] : 0),
        balance_formatted: format_indian_currency(main_tag_data ? main_tag_data[:sum] : 0)
      }
      board_data
    end

    respond_to do |format|
      format.html # renders default view
      format.json { render json: @boards_with_financials }
    end
  end

  def show
    @board = TagInsightsBoardRecord.find(params[:id])
    @insights = TagInsightsBoard.new(@board.main_tag, @board.sub_tags)
    @flattened = @insights.flattened_view
    @show_in_dashboard = true # Flag to indicate this should be shown in the dashboard

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

  def set_full_layout_flag
    @render_with_sidebar = true
  end
end
