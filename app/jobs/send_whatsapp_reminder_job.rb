# frozen_string_literal: true

class SendWhatsappReminderJob < ApplicationJob
  queue_as :default

  def perform(transaction_id)
    transaction = Transaction.find_by(id: transaction_id)
    return unless transaction && transaction.reminder.present?

    to = transaction.reminder['whatsapp_number']
    message = transaction.reminder['message'] || "You have a transaction reminder."
    return unless to.present?

    WhatsappService.send_message(to: to, body: message)
  end
end

