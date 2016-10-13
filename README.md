This repo contains the frontend for [Korp](https://spraakbanken.gu.se/korp), a frontend for the IMS Open Corpus Workbench (CWB). The korp frontend is a great tool for searching and
and visualising natural language corpus data. 

Korp is developed by [Språkbanken](https://spraakbanken.gu.se) at the University of Gothenburg, Sweden. 

Documentation:
- [Frontend documentation](https://spraakbanken.gu.se/eng/research/infrastructure/korp/distribution/frontend)
- [Backend documentation](https://spraakbanken.gu.se/eng/research/infrastructure/korp/distribution/backend)
- The pipeline used to tag and otherwise process raw Swedish-language corpus data is documented [here](https://spraakbanken.gu.se/eng/research/infrastructure/korp/distribution/corpuspipeline)

Local setup for Ubuntu:
sudo apt-get install npm
sudo npm install -g grunt-cli
sudo apt-get install nodejs
npm install
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo apt-get install ruby-dev
sudo gem install compass
grunt serve

