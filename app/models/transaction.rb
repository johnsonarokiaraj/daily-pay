class Transaction < ApplicationRecord
  include DailyBackup

  acts_as_taggable_on :tags

  validate :validate_transaction
  before_save :auto_tagging


  def validate_transaction
    validate_name(:name, "Transcation name")
  end

  def auto_tagging
    current_tags = self.tag_list.map(&:downcase)
    AutoTagRule.all.each do |rule|
      required_tags = rule.required_tags.map(&:downcase)
      auto_tags = rule.auto_tags
      if required_tags.all? { |t| current_tags.include?(t) }
        auto_tags.each do |auto_tag|
          self.tag_list.add(auto_tag.capitalize) unless current_tags.include?(auto_tag.downcase)
        end
      end
    end
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
          is_credit: t.is_credit,
          transaction_date: t.transaction_date,
          created_at: t.created_at,
          updated_at: t.updated_at
        }
      end
      credit_sum = transactions.where(is_credit: true).pluck(:amount).map(&:to_f).sum
      debit_sum = transactions.where(is_credit: false).pluck(:amount).map(&:to_f).sum

      avg = transactions.any? ? sum / transactions.size : 0.0
      result[main_tag] << {
        sub_tag => {
          transactions: transaction_hashes,
          credit_sum: credit_sum,
          debit_sum: debit_sum,
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

    # Calculate main tag totals from credit and debit sums
    main_credit_sum = main_tag_data.sum { |h| h.values.first[:credit_sum] }
    main_debit_sum = main_tag_data.sum { |h| h.values.first[:debit_sum] }
    main_total_sum = main_credit_sum - main_debit_sum
    main_count = main_tag_data.sum { |h| h.values.first[:count] }

    result << {
      type: :main_tag,
      tag: @main_tag,
      sum: main_total_sum,
      credit_sum: main_credit_sum,
      debit_sum: main_debit_sum,
      count: main_count
    }

    main_tag_data.each do |subtag_hash|
      sub_tag, details = subtag_hash.first

      # Add sub tag with credit, debit, and balance info
      result << {
        type: :sub_tag,
        tag: sub_tag,
        sum: details[:credit_sum] - details[:debit_sum],
        credit_sum: details[:credit_sum],
        debit_sum: details[:debit_sum],
        count: details[:count],
        balance: details[:credit_sum] - details[:debit_sum]
      }

      details[:transactions].each do |txn|
        # Include is_credit info in transaction entries
        result << {
          type: :transaction,
          date: txn[:transaction_date],
          name: txn[:name],
          amount: txn[:amount],
          is_credit: txn[:is_credit],
          tags: [@main_tag, sub_tag]
        }
      end
    end
    result
  end
end
