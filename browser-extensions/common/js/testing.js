
var buttons = [
  {
    name: "Reset",
    action: "debug-reset"
  },
  {
    name: "Clear all caches",
    action: "cache-all-clear"
  },
  {
    name: "Clear geo.xml cache",
    action: "cache-geo-clear"
  },
  {
    name: "Get current cache data",
    action: "cache-get"
  },
  {
    name: "Get current cache data summary",
    action: "cache-get-summary"
  },
  {
    name: "Disable fetching geo.xml",
    action: "disable-geo"
  },
  {
    name: "Enable fetching geo.xml",
    action: "enable-geo"
  }
]

function initial_page_setup() {
  var main = get_main_div();
  append_message("Created page")
  create_buttons(main)
}

function create_buttons(div) {
  $.each(buttons, function(index, action_type) {
    append_message("Creating '"+action_type.name+"'")
    var b = $('<button/>',
      {
          text: action_type.name,
          click: function () {
            append_message(action_type.action)
            browser.runtime.sendMessage({'action': action_type.action}).then(function (response) {
                if (response && 'msg' in response) {
                    append_message(response.msg)
                }
            });
          }
      })
    div.append(b)
  })

}

function get_main_div() {
  return $('#main')
}

function get_debug_div() {
  return $('#debug')
}

function append_message(message) {
  var date_str = new Date()
  get_debug_div().prepend($('<p/>').text(date_str+": "+message))
}

// Code to run when the document's DOM is ready
$( document ).ready(function() {
    initial_page_setup()
});
