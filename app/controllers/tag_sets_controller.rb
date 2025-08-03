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

    respond_to do |format|
      if @tag_set.save
        format.html { redirect_to tag_sets_path, notice: 'Tag set was successfully created.' }
        format.json { render json: @tag_set.as_json(only: [:id, :name], methods: [:tags]), status: :created }
      else
        format.html { render :new }
        format.json { render json: @tag_set.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
  end

  def update
    respond_to do |format|
      if @tag_set.update(tag_set_params)
        format.html { redirect_to tag_sets_path, notice: 'Tag set was successfully updated.' }
        format.json { render json: @tag_set.as_json(only: [:id, :name], methods: [:tags]) }
      else
        format.html { render :edit }
        format.json { render json: @tag_set.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @tag_set.destroy
    respond_to do |format|
      format.html { redirect_to tag_sets_path, notice: 'Tag set was successfully deleted.' }
      format.json { head :no_content }
    end
  end

  private

  def set_tag_set
    @tag_set = TagSet.find(params[:id])
  end

  def tag_set_params
    params.require(:tag_set).permit(:name, tags: [])
  end
end
