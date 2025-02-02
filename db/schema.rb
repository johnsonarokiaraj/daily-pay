# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_02_01_182853) do
  create_table "budgets", force: :cascade do |t|
    t.integer "month_id", null: false
    t.integer "member_id", null: false
    t.integer "amount", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ledger", force: :cascade do |t|
    t.integer "member_id", null: false
    t.integer "payment_source_id", null: false
    t.integer "amount", null: false
    t.string "name", limit: 191, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "members", force: :cascade do |t|
    t.string "name", limit: 191, null: false
    t.string "relationship", limit: 191, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "months", force: :cascade do |t|
    t.string "name", limit: 191, null: false
    t.integer "year_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payment_source", force: :cascade do |t|
    t.string "name", limit: 191, null: false
    t.string "type", limit: 191, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "spent_category", force: :cascade do |t|
    t.string "name", limit: 191, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "years", force: :cascade do |t|
    t.string "name", limit: 191, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
