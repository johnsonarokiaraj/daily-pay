class TagSetsController < ApplicationController
  before_action :set_tag_set, only: [:edit, :update, :destroy]

  def index
    @tag_sets = TagSet.all

    respond_to do |format|
      format.html
      format.json { render json: @tag_sets.as_json(only: [:id, :name], methods: [:tags]) }
    end
  end

  def new
    @tag_set = TagSet.new
  end

  def create
    @tag_set = TagSet.new(tag_set_params)

    if @tag_set.save
      redirect_to tag_sets_path, notice: 'Tag set was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @tag_set.update(tag_set_params)
      redirect_to tag_sets_path, notice: 'Tag set was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @tag_set.destroy
    redirect_to tag_sets_path, notice: 'Tag set was successfully deleted.'
  end

  private

  def set_tag_set
    @tag_set = TagSet.find(params[:id])
  end

  def tag_set_params
    params.require(:tag_set).permit(:name, :tags_string)
  end
end
