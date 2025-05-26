class ClosuresController < ApplicationController

  def index
    @closures = Closure.all
  end

  def create
    @closure = Closure.new(closure_params)
    msg = @closure.save ? { notice: "Closure added successfully." } : { alert: @closure.errors.full_messages[0] }

    redirect_to closures_path, **msg
  end

  private

  def closure_params
    params.require(:closure).permit(:name, :start_date, :end_date)
  end
end
