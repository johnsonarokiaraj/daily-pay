namespace :recurring do
  desc "Run due recurring transactions"
  task run_due: :environment do
    RecurringTransaction.run_due!
    puts "Recurring transactions processed"
  end
end
