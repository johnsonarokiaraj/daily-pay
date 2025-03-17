class Admin::MembersController < ApplicationController

  def index
    @members = Member.all
  end

  def create
    @member = Member.new(member_params)
    msg = @member.save ? { notice: "Member added successfully." } : { alert: @member.errors.full_messages[0] }

    redirect_to admin_members_path, **msg
  end

  private

  def member_params
    params.require(:member).permit(:name, :relationship)
  end
end
