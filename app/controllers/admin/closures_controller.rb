class Admin::ClosuresController < ApplicationController

  def index
    @closures = Closure.all
  end

  def create
    @closure = Closure.new(closure_params)
    msg = @closure.save ? { notice: "Closure added successfully." } : { alert: @member.errors.full_messages[0] }

    redirect_to admin_members_path, **msg
  end

  private

  def closure_params
    params.require(:clousure).permit(:name, :date)
  end
end
