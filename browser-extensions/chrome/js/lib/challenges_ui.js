/*
 * data object is of the form:
 * [
 *  alphabeteer: {
 *    "title_text": "Alphabeteer Challenge",
 *    "complete": false,
 *    "subparts": [
 *      'a',
 *      'b',
 *      'c'
 *    ],
 *    "subparts_completed": {
 *      "a": {
 *          "name":
 *          "position":
 *          ...
 *      },
 *    ]
 *    If there are any recommendations about what to do for these parts, then
 *    they can be added to this object
 *    "subparts_remaining_recommendations": {
 *      "c": {'Congleton'}
 *    }
 *  },
 * ]
 */

function generate_challenge_table(data) {

   popular_challenges = ['alphabeteer', 'tourist', 'pirates']

   visible_challenges = []
   hidden_challenges = []

   // Sort the data into different sections.
   // Those which are complete will be shown
   // Those that are popular, will be shown
   // Everything else comes under a 'more' link

   for (var challenge in data) {
       visible_challenges.push(challenge)
       // if (popular_challenges.indexOf(challenge) != -1 || data[challenge].complete) {
       //     visible_challenges.push(challenge)
       // } else {
       //     hidden_challenges.push(challenge)
       // }
   }

   console.log('visible_challenges: '+visible_challenges)
   console.log('hidden_challenges: '+hidden_challenges)

   console.log('Generating Challenge Table')
   var table = $('<table></table>')
   // Set the ID so that we can easily find it again
   table.attr("id", "challenge-table")
   table.attr("id", "results")
   // Optionally add a class with .addClass(this.tableClass)
   table.append($('<caption></caption>').text('Challenges'))

   visible_challenges.forEach(function (challenge_name) {
       challenge = data[challenge_name]

       challenge_tbody_header = $('<tbody></tbody>')
       challenge_tbody_header.attr('id', "challenge_tbody_header_"+challenge_name)

       challenge_tbody_detail = $('<tbody></tbody>')
       challenge_tbody_detail.attr('id', "challenge_tbody_detail_"+challenge_name)

       // Print the main summary row
       main_row = $('<tr></tr>')

       var badge_img = $('<img>'); //Equivalent: $(document.createElement('img'))
       badge_img.attr('src', chrome.extension.getURL("/images/badges/256x256/"+challenge.badge_icon+".png"));
       badge_img.attr('alt',challenge.name)
       badge_img.attr('title',challenge.name)
       badge_img.attr('width',24)
       badge_img.attr('height',24)
       badge_img.click(function(){
           $("tbody[id=challenge_tbody_detail_"+challenge_name+"]").toggle();
       });

       var anchor_tag = $('<a/>')
       anchor_tag.attr('name', challenge_name)
       anchor_tag.append(badge_img)

       main_row.append($('<th></th>').append(anchor_tag))

       // main_row.append($('<th></th>').text(challenge.shortname))
       main_row.append($('<th></th>').text(challenge.name))
       main_row.append($('<th></th>'))
       main_row.append($('<th></th>').text(challenge.completed_on))
       if (challenge.summary_text !== undefined) {
           main_row.append($('<th></th>').text(challenge.summary_text))
       } else {
           main_row.append($('<th></th>').text(challenge.subparts_completed_count+"/"+challenge.subparts_count))
       }
       // main_row.append($('<th></th>').text(challenge.complete))
       challenge_tbody_header.append(main_row)

       // Print the subparts
       challenge.subparts_detail.forEach(function (subpart_detail) {
           subpart_row = $('<tr></tr>')
           subpart_row.append($('<td></td>').text("-"))
           if (subpart_detail != null) {

               subpart_row.append($('<td></td>').text(subpart_detail.subpart))
               subpart_row.append($('<td></td>').text(subpart_detail.name))
               subpart_row.append($('<td></td>').text(subpart_detail.info))

               challenge_tbody_detail.append(subpart_row)
           } else {
                subpart_row.append($('<td></td>').text('Missing'))
                challenge_tbody_detail.append(subpart_row)
           }

       });

       table.append(challenge_tbody_header)
       table.append(challenge_tbody_detail)

   });

   console.log(table)
   return table
}
