module Api
  class TasksController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :set_task_section
    before_action :set_task, only: [:show, :update, :destroy]

    def index
      tasks = @task_section.tasks.ordered
      render json: tasks.map { |task|
        {
          id: task.id,
          task_id: task.task_id,
          name: task.name,
          description: task.description,
          status: task.status,
          completion_date: task.completion_date,
          days_remaining: task.days_remaining,
          time_status: task.time_status,
          status_color: task.status_color,
          position: task.position,
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      }
    end

    def show
      render json: {
        id: @task.id,
        task_id: @task.task_id,
        name: @task.name,
        description: @task.description,
        status: @task.status,
        completion_date: @task.completion_date,
        days_remaining: @task.days_remaining,
        time_status: @task.time_status,
        status_color: @task.status_color,
        position: @task.position,
        created_at: @task.created_at,
        updated_at: @task.updated_at
      }
    end

    def create
      task = @task_section.tasks.build(task_params)

      if task.save
        render json: {
          id: task.id,
          task_id: task.task_id,
          name: task.name,
          description: task.description,
          status: task.status,
          completion_date: task.completion_date,
          days_remaining: task.days_remaining,
          time_status: task.time_status,
          status_color: task.status_color,
          position: task.position,
          created_at: task.created_at,
          updated_at: task.updated_at
        }, status: :created
      else
        render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @task.update(task_params)
        render json: {
          id: @task.id,
          task_id: @task.task_id,
          name: @task.name,
          description: @task.description,
          status: @task.status,
          completion_date: @task.completion_date,
          days_remaining: @task.days_remaining,
          time_status: @task.time_status,
          status_color: @task.status_color,
          position: @task.position,
          created_at: @task.created_at,
          updated_at: @task.updated_at
        }
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @task.destroy
      head :no_content
    end

    private

    def set_task_section
      @task_section = TaskSection.find(params[:task_section_id])
    end

    def set_task
      @task = @task_section.tasks.find(params[:id])
    end

    def task_params
      params.require(:task).permit(:name, :description, :status, :completion_date, :position)
    end
  end
end
