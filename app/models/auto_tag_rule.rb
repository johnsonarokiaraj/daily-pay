class AutoTagRule < ApplicationRecord
  serialize :required_tags, coder: JSON
  serialize :auto_tags, coder: JSON
end
