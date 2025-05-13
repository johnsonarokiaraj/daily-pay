class ApplicationController < ActionController::Base
  before_action :load_all_tags

  def load_all_tags
    @all_tags = ActsAsTaggableOn::Tag.pluck(:name)
  end
end
