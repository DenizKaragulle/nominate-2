# Doc Site Config

require "rubygems"
require "kss"
require "redcarpet"
require "tailcoat"

# Helpers

# Automatic image dimensions on image_tag helper
activate :automatic_image_sizes

set :markdown_engine, :redcarpet
set :markdown,
    :autolink => true,
    :fenced_code_blocks => true,
    :tables => true,
    :with_toc_data => true

Markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, {
  :fenced_code_blocks => true,
  :tables => true,
  autolink: true,
  with_toc_data: true
})

before do
  Styleguide ||= Kss::Parser.new("lib/stylesheets/tailcoat/")
end

# Methods defined in the helpers block are available in templates
helpers do
  def guide
    Styleguide
  end

  def section_link(section)
    title = Styleguide.section(section).comment_sections.first.gsub("#", "").strip
    "<li><a href='#section-#{section}'>#{title}</a></li>"
  end

  # Usage <%= menu_item "Page", "/page", "page.html" %>
  # will generate an li that will have class="current"
  # if the current page being rendered is "page.html"
  def menu_item(title, path, test=nil, options={})
    "<li#{page_indicator_for test}>#{link_to title, path, options}</li>"
  end

  # will return class='current' if the file is the file
  # being rendered or empty string if it is not
  def page_indicator_for(test)
    return if test == nil
    # test = (current_language || "") + "/" + (test || "") if test.is_a? String

    if test.is_a? Array
      test.find { |e| current_page.path.match(e) } ? "class='current'" : ""
    else
      current_page.path.match(test) ? ' class="current"' : ""
    end
  end

  def styleguide(section, &block)
    @section = Styleguide.section(section)
    @description = Markdown.render(@section.description)
    @example_html = nil
    @escaped_html = nil
    unless block.nil?
      @example_html = kss_capture{ block.call }
      @escaped_html = ERB::Util.html_escape(@example_html.sub(" class=\"$modifier_class\"", ""))
    end
    @_out_buf << partial('styleguide_block')
  end

  def search_block(section, &block)
    @section = Styleguide.section(section)
    @title = @section.description.lines.first
    @title.gsub!('#','')
    @title = @title[1...-1]
    if @section.description.split("\n").length > 1
      description = @section.description.split("\n").fetch(2)
      @description = description[0...-1].gsub("```", "'").gsub("`", "'").gsub('"', "'")
    else
      @description = ""
    end
    case section[0,1].to_i
    when 1
      page = 'layouts'
    when 2
      page = 'type'
    when 3
      page = 'components'
    when 4
      page = 'patterns'
    when 5
      page = 'sass'
    when 6
      page = 'javascript'
    end
    @link = base_url + page + "/#section-" + section
    <<-eos
    {
      "section": "#{section}",
      "page": "#{page}",
      "title": "#{@title}",
      "description": "#{@description}",
      "link": "#{@link}"
    },
    eos
  end

  # KSS: Captures the result of a block within an erb template without spitting
  # it to the output buffer.
  def kss_capture(&block)
    out, @_out_buf = @_out_buf, ""
    yield
    @_out_buf
  ensure
    @_out_buf = out
  end

  def strip_whitespace_for_pre string
    # gets an array of the leading whitespace values for each line
    ws = string.lines.collect { |l|
      l[/\A */].size
    }

    ws.delete(0) # remove zero whitespace lines
    ws.delete_at(-1) # remove the last time since its going to be <% end %> which we dont want

    # get the section of each line starting at the lowest whitespace to the end of the line
    lines = string.lines.collect { |l|
      l[ws.min, l.size]
    }.join()

    ERB::Util.html_escape lines.strip
  end

  def base_url
    if environment === :build
      return "/tailcoat/"
    else
      return "/"
    end
  end

  def latest_version
    spec = Gem::Specification::load("tailcoat.gemspec")
    spec.version
  end
end

activate :directory_indexes

set :source, "docs/source"
set :build_dir, "docs/build"
set :partials_dir, "partials"
set :css_dir, "assets/stylesheets"
set :images_dir, "assets/images"
set :fonts_dir, "assets/fonts"
set :js_dir, "assets/javascripts"

configure :build do

  activate :minify_css
  activate :minify_javascript
  activate :relative_assets

end
