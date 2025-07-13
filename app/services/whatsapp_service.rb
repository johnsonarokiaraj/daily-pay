# frozen_string_literal: true

require 'net/http'
require 'uri'
require 'json'

class WhatsappService
  # Replace with your WhatsApp API endpoint and credentials
  API_URL = ENV.fetch('WHATSAPP_API_URL', 'https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages.json')
  ACCOUNT_SID = ENV['TWILIO_ACCOUNT_SID']
  AUTH_TOKEN = ENV['TWILIO_AUTH_TOKEN']
  FROM_NUMBER = ENV['WHATSAPP_FROM_NUMBER'] # e.g., 'whatsapp:+14155238886'

  def self.send_message(to:, body:)
    uri = URI.parse(API_URL)
    request = Net::HTTP::Post.new(uri)
    request.basic_auth(ACCOUNT_SID, AUTH_TOKEN)
    request.set_form_data(
      'From' => FROM_NUMBER,
      'To' => "whatsapp:#{to}",
      'Body' => body
    )

    req_options = {
      use_ssl: uri.scheme == 'https',
    }

    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      http.request(request)
    end
    response.code == '201'
  end
end

