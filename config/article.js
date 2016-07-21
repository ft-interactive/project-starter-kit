export default _ => ({

  // link file UUID
  id: '$uuid',

  // canonical URL of the published page
  // "$url" get filled in by the ./configure script
  url: '$url',

  // To set an exact publish date do this:
  //       new Date('2016-05-17T17:11:22Z')
  publishedDate: new Date(),

  headline: 'Politics and the English Language',

  summary: 'Political language is designed to make lies sound truthful and murder respectable, and to give an appearance of solidity to pure wind',

  topic: {
    name: 'Starter Kit',
    url: '/foo'
  },

  relatedArticle: {
    text: 'Related article »',
    url: 'https://en.wikipedia.org/wiki/Politics_and_the_English_Language'
  },

  // Byline can by a plain string, markdown, or array of authors
  // if array of authors, url is optional
  byline: [
    {name: 'Author One', url: '/foo/bar'},
    {name: 'Author Two'},
  ],

  // Appears in the HTML <title>
  title: '',

  // meta data
  description: '',

  /*
  TODO: Select Twitter card type -
        "summary" or "summary_large_image"

        Twitter card docs:
        https://dev.twitter.com/cards/markup
  */
  twitterCard: 'summary',

  // optional social meta data
  // twitterCreator: '@individual's_account',
  // tweetText:  '',
  // socialHeadline: '',
  // socialSummary:  '',

  onwardjourney: {

    // "list" (methode list) or "topic"
    type: '',

    // topic or list id
    id: '',

    // a heading is provided automatically if not set (peferred)
    heading: ''
  },

  tracking: {

    /*

    Microsite Name

    e.g. guffipedia, business-books, baseline.
    Used to query groups of pages, not intended for use with
    one off interactive pages. If you're building a microsite
    consider more custom tracking to allow better analysis.
    Also used for pages that do not have a UUID for whatever reason
    */
    // micrositeName: '',

    /*
    Product name

    This will usually default to "IG"
    however another value may be needed
    */
    // product: '',
  }
})
