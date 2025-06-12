class Api::TagsController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def index
    @tags = ActsAsTaggableOn::Tag.all.map do |tag|
      {
        id: tag.id,
        name: tag.name,
        taggings_count: tag.taggings_count || 0,
        total_amount: Transaction.tagged_with(tag.name).sum(:amount)
      }
    end

    respond_to do |format|
      format.html
      format.json { render json: { tags: @tags } }
    end
  end

  def create
    @tag = ActsAsTaggableOn::Tag.new(tag_params)
    
    respond_to do |format|
      if @tag.save
        format.html { redirect_to tags_path, notice: "Tag created successfully." }
        format.json { render json: { status: 'success', tag: tag_json(@tag) } }
      else
        format.html { redirect_to tags_path, alert: @tag.errors.full_messages[0] }
        format.json { render json: { status: 'error', errors: @tag.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def update
    @tag = ActsAsTaggableOn::Tag.find(params[:id])
    
    respond_to do |format|
      if @tag.update(tag_params)
        format.html { redirect_to tags_path, notice: "Tag updated successfully." }
        format.json { render json: { status: 'success', tag: tag_json(@tag) } }
      else
        format.html { redirect_to tags_path, alert: @tag.errors.full_messages[0] }
        format.json { render json: { status: 'error', errors: @tag.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @tag = ActsAsTaggableOn::Tag.find(params[:id])
    
    respond_to do |format|
      if @tag.present?
        @tag.taggings.destroy_all
        @tag.destroy
        format.html { redirect_to tags_path, notice: "Tag deleted successfully." }
        format.json { render json: { status: 'success' } }
      else
        format.html { redirect_to tags_path, alert: "Unable to delete tag!" }
        format.json { render json: { status: 'error' }, status: :unprocessable_entity }
      end
    end
  end

  private

  def tag_json(tag)
    {
      id: tag.id,
      name: tag.name,
      taggings_count: tag.taggings_count || 0,
      total_amount: Transaction.tagged_with(tag.name).sum(:amount)
    }
  end

  def tag_params
    params.require(:tag).permit(:name)
  end
end




