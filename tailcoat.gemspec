#encoding: utf-8

require "json"
package = JSON.parse(File.read("package.json"))

Gem::Specification.new do |s|
  s.name        = package["name"]
  s.version     = package["version"]
  s.summary     = package["description"]
  s.authors     = ["Patrick Arlt", "Paul C. Pederson", "Nate Goldman", "Nikolas Wise"]
  s.email       = package["author"]["email"]
  s.files       = ["lib/tailcoat.rb"]
  s.homepage    = package["homepage"]

  s.add_dependency "compass", "~> 1.0.0"
end
