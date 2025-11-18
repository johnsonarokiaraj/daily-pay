class Api::TransactionTagUpdaterController < ApplicationController
  protect_from_forgery with: :null_session

  # POST /api/transaction_tag_updater
  def create
    condition_tag_name = params[:condition_tag]
    condition_type = params[:condition_type] # "present" or "absent"
    new_tag_names = params[:new_tags] || []

    updated_count = 0
    transactions = if condition_type == "present"
      Transaction.tagged_with(condition_tag_name)
    else
      Transaction.where.not(id: Transaction.tagged_with(condition_tag_name).pluck(:id))
    end

    transactions.find_each do |transaction|
      new_tag_names.each do |tag_name|
        unless transaction.tag_list.include?(tag_name)
          transaction.tag_list.add(tag_name)
          transaction.save
          updated_count += 1
        end
      end
    end

    render json: { message: "Tags updated for #{updated_count} transactions." }
  rescue => e
    render json: { error: e.message }, status: 500
  end
end
