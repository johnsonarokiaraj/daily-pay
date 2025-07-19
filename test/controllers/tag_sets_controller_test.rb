require "test_helper"

class TagSetsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get tag_sets_index_url
    assert_response :success
  end

  test "should get new" do
    get tag_sets_new_url
    assert_response :success
  end

  test "should get create" do
    get tag_sets_create_url
    assert_response :success
  end

  test "should get edit" do
    get tag_sets_edit_url
    assert_response :success
  end

  test "should get update" do
    get tag_sets_update_url
    assert_response :success
  end

  test "should get destroy" do
    get tag_sets_destroy_url
    assert_response :success
  end
end
