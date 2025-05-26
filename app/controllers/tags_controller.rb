class TagsController < ApplicationController
  def index
    @tags = ActsAsTaggableOn::Tag.all
  end
  def destroy
    @tag = ActsAsTaggableOn::Tag.where(name: params[:id]).first
    if @tag.present?
      @tag.taggings.destroy_all
      @tag.destroy
      @msg = { notice: "Tag deleted successfully." }
    else
      @msg = { alert: "Unable to delete tag!" }
    end

    redirect_to tags_path, **@msg
  end
end




