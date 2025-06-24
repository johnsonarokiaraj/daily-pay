class TagsController < ApplicationController
  def index
    tags = ActsAsTaggableOn::Tag.pluck(:name)
    render json: tags
  end
end

