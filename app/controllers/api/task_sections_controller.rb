module Api
  class TaskSectionsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
      sections = TaskSection.ordered.includes(:tasks)
      render json: sections.map { |section|
        {
          id: section.id,
          name: section.name,
          abbreviation: section.abbreviation,
          description: section.description,
          position: section.position,
          tasks_count: section.tasks.count,
          pending_tasks_count: section.tasks.pending.count,
          created_at: section.created_at,
          updated_at: section.updated_at
        }
      }
    end

    def show
      section = TaskSection.find(params[:id])
      tasks = section.tasks.ordered.map { |task|
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

      render json: {
        section: {
          id: section.id,
          name: section.name,
          abbreviation: section.abbreviation,
          description: section.description,
          position: section.position,
          created_at: section.created_at,
          updated_at: section.updated_at
        },
        tasks: tasks
      }
    end

    def create
      section = TaskSection.new(section_params)

      if section.save
        render json: {
          id: section.id,
          name: section.name,
          abbreviation: section.abbreviation,
          description: section.description,
          position: section.position,
          tasks_count: 0,
          pending_tasks_count: 0,
          created_at: section.created_at,
          updated_at: section.updated_at
        }, status: :created
      else
        render json: { errors: section.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      section = TaskSection.find(params[:id])

      if section.update(section_params)
        render json: {
          id: section.id,
          name: section.name,
          abbreviation: section.abbreviation,
          description: section.description,
          position: section.position,
          tasks_count: section.tasks.count,
          pending_tasks_count: section.tasks.pending.count,
          created_at: section.created_at,
          updated_at: section.updated_at
        }
      else
        render json: { errors: section.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      section = TaskSection.find(params[:id])
      section.destroy
      head :no_content
    end

    private

    def section_params
      params.require(:task_section).permit(:name, :abbreviation, :description, :position)
    end
  end
end
