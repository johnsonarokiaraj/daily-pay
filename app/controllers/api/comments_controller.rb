module Api
  class CommentsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :set_task
    before_action :set_comment, only: [:show, :update, :destroy]

    def index
      comments = @task.comments.ordered
      render json: comments.map { |comment|
        {
          id: comment.id,
          content: comment.content,
          author: comment.author,
          formatted_created_at: comment.formatted_created_at,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }
      }
    end

    def show
      render json: {
        id: @comment.id,
        content: @comment.content,
        author: @comment.author,
        formatted_created_at: @comment.formatted_created_at,
        created_at: @comment.created_at,
        updated_at: @comment.updated_at
      }
    end

    def create
      comment = @task.comments.build(comment_params)

      if comment.save
        render json: {
          id: comment.id,
          content: comment.content,
          author: comment.author,
          formatted_created_at: comment.formatted_created_at,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }, status: :created
      else
        render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @comment.update(comment_params)
        render json: {
          id: @comment.id,
          content: @comment.content,
          author: @comment.author,
          formatted_created_at: @comment.formatted_created_at,
          created_at: @comment.created_at,
          updated_at: @comment.updated_at
        }
      else
        render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @comment.destroy
      head :no_content
    end

    private

    def set_task
      task_section = TaskSection.find(params[:task_section_id])
      @task = task_section.tasks.find(params[:task_id])
    end

    def set_comment
      @comment = @task.comments.find(params[:id])
    end

    def comment_params
      params.require(:comment).permit(:content, :author)
    end
  end
end
