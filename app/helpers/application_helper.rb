module ApplicationHelper
  def active_class(path)
    'active' if current_page?(path)
  end

  def active_class_condition(condition)
    'active' if condition
  end

  def relationship_values
    Member::RELATION_TYPES
  end

  def payment_type_values
    PaymentSource.all.map{|m| [m.name, m.id]}
  end

  def member_values
    Member.all.map{|m| [m.name, m.id]}
  end

  def spent_category_values
    SpentCategory.all.map{|m| [m.name, m.id]}
  end
end
