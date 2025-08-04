class AutoTagRulesController < ApplicationController
  before_action :set_auto_tag_rule, only: [:edit, :update, :destroy]

  def index
    @auto_tag_rules = AutoTagRule.all

    respond_to do |format|
      format.html
      format.json { render json: @auto_tag_rules.as_json(only: [:id, :required_tags, :auto_tags]) }
    end
  end

  def new
    @auto_tag_rule = AutoTagRule.new
  end

  def create
    @auto_tag_rule = AutoTagRule.new(auto_tag_rule_params)

    respond_to do |format|
      if @auto_tag_rule.save
        format.html { redirect_to auto_tag_rules_path, notice: 'Auto tag rule was successfully created.' }
        format.json { render json: @auto_tag_rule.as_json(only: [:id, :required_tags, :auto_tags]), status: :created }
      else
        format.html { render :new }
        format.json { render json: @auto_tag_rule.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
  end

  def update
    respond_to do |format|
      if @auto_tag_rule.update(auto_tag_rule_params)
        format.html { redirect_to auto_tag_rules_path, notice: 'Auto tag rule was successfully updated.' }
        format.json { render json: @auto_tag_rule.as_json(only: [:id, :required_tags, :auto_tags]) }
      else
        format.html { render :edit }
        format.json { render json: @auto_tag_rule.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @auto_tag_rule.destroy
    respond_to do |format|
      format.html { redirect_to auto_tag_rules_path, notice: 'Auto tag rule was successfully deleted.' }
      format.json { head :no_content }
    end
  end

  private

  def set_auto_tag_rule
    @auto_tag_rule = AutoTagRule.find(params[:id])
  end

  def auto_tag_rule_params
    params.require(:auto_tag_rule).permit(required_tags: [], auto_tags: [])
  end
end
