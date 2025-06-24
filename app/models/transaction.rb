class Transaction < ApplicationRecord
  include DailyBackup

  acts_as_taggable_on :tags

  validate :validate_transaction

  def validate_transaction
    validate_name(:name, "Transcation name")
  end

  def tag_list=(names)
    names_array = names.is_a?(String) ? names.split(',') : names
    capitalized_names = names_array.map { |n| n.strip.capitalize }
    super(capitalized_names)
  end

  def formatted_amount
    "$#{amount.to_f}"
  end

  def self.tag_summary_view(main_tag, sub_tags)
    result = { main_tag => [] }
    sub_tags.each do |sub_tag|
      tags = [main_tag, sub_tag]
      transactions = Transaction.tagged_with(tags)
      transaction_hashes = transactions.map do |t|
        {
          id: t.id,
          name: t.name,
          amount: t.amount.to_f,
          created_at: t.created_at,
          updated_at: t.updated_at
        }
      end
      sum = transactions.pluck(:amount).map(&:to_f).sum
      avg = transactions.any? ? sum / transactions.size : 0.0
      result[main_tag] << {
        sub_tag => {
          transactions: transaction_hashes,
          sum: sum,
          average: avg,
          count: transactions.size
        }
      }
    end
    result
  end
end

# TagInsightsBoard: Service object to wrap tag_summary_view and provide data for the insights board feature
class TagInsightsBoard
  attr_reader :main_tag, :sub_tags, :data

  def initialize(main_tag, sub_tags)
    @main_tag = main_tag
    @sub_tags = sub_tags
    @data = Transaction.tag_summary_view(main_tag, sub_tags)
  end

  # Returns a flat array for rendering in the requested format
  def flattened_view
    result = []
    main_tag_data = @data[@main_tag]
    main_sum = main_tag_data.sum { |h| h.values.first[:sum] }
    main_count = main_tag_data.sum { |h| h.values.first[:count] }
    result << { type: :main_tag, tag: @main_tag, sum: main_sum, count: main_count }
    main_tag_data.each do |subtag_hash|
      sub_tag, details = subtag_hash.first
      result << { type: :sub_tag, tag: sub_tag, sum: details[:sum], count: details[:count] }
      details[:transactions].each do |txn|
        result << { type: :transaction, date: txn[:created_at], name: txn[:name], amount: txn[:amount], tags: [@main_tag, sub_tag] }
      end
    end
    result
  end
end
