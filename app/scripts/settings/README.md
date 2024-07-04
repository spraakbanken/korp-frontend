# Settings and config

**Config** refers to a body of configuration that mainly describes the corpus data, including the _modes_ that are used to organize them, and the _attributes_ which are found in the data.
The config is mainly fetched from the backend, which does little more than read it from a bunch of YAML files.
Once fetched, they are transformed from its current structure to a previous version of the structure – only because we haven't put time into updating the usage in code yet.
(This should probably be remedied after introduction of more TypeScript.)

**Settings** is configuration for the frontend app. It is read from the configuration directory (confusingly, as `config.yml`; see [frontend_devel.md](../../doc/frontend_devel.md)).

However, the transformed config and the settings are then merged into the same object.
This object is then used with `import settings from "@/settings"`.

As an exception to the serializable structure of `settings`, the **corpus listing** singleton object (`CorpusListing` or `ParallelCorpusListing`) lives as `settings.corpusListing`.
This is weird and should probably change.