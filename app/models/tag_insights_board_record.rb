require 'yaml'

class TagInsightsBoardRecord < ApplicationRecord
  # Stores user-created TagInsightsBoard configurations for future access
  # Attributes: name (string), main_tag (string), sub_tags (text/serialized array), user_id (optional), created_at, updated_at
  # Robust coder that tolerates legacy YAML or loosely formatted arrays
  class SubTagsCoder
    def self.dump(value)
      Array(value).compact
    end

    def self.load(value)
      return [] if value.nil? || value == ""
      return value if value.is_a?(Array)

      if value.is_a?(String)
        # Try JSON first
        begin
          parsed = JSON.parse(value)
          return parsed if parsed.is_a?(Array)
        rescue JSON::ParserError
        end

        # Try YAML (legacy serialized format)
        begin
          parsed = YAML.safe_load(value, permitted_classes: [Date, Time], aliases: true)
          return parsed if parsed.is_a?(Array)
        rescue StandardError
        end

        # Normalize simple ruby-like arrays ['A','B'] -> ["A","B"] and retry JSON
        begin
          stripped = value.strip
          if stripped.start_with?("[") && stripped.end_with?("]")
            normalized = stripped.gsub("'", '"')
            parsed = JSON.parse(normalized)
            return parsed if parsed.is_a?(Array)
          end
        rescue JSON::ParserError
        end

        # Fallback: comma-separated string
        return value.split(',').map { |s| s.to_s.strip }.reject(&:empty?)
      end

      []
    end
  end

  serialize :sub_tags, coder: SubTagsCoder
  validates :name, :main_tag, presence: true

  # Set default position before validation if not set
  before_validation :set_default_position, on: :create

  default_scope { order(:position) }

  # If sub_tags is a string, try to parse it as JSON.
  # This handles cases where the data might be a JSON string.
  def sub_tags=(value)
    if value.is_a?(String)
      begin
        super(JSON.parse(value))
      rescue JSON::ParserError
        # If it's not a valid JSON string, treat it as a single-element array.
        # This handles simple string assignments.
        super([value])
      end
    else
      super(value)
    end
  end

  private

  def set_default_position
    self.position ||= (TagInsightsBoardRecord.unscoped.maximum(:position) || 0) + 1
  end
end
