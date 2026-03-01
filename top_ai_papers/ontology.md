# AI Papers

Most AI papers usually introduce a new model or dataset, or propose a novel concept that is tested and experimented with using models. Thus, there are three main ontology types in this domain:

1. **Paper** – The core publication, describing novel ideas, experiments, and results.
2. **Model** – The computational or mathematical approach introduced or evaluated by papers.
3. **Dataset** – The collection of structured data used for training or evaluation, often introduced or curated as part of research.

These three types form the foundation of the ontology for top AI research papers.

## Paper

The core type is defined in the Geo space. At the moment, there is a custom AI Paper type, but migration will be needed in the future.

Geo Paper Type:
- Identity
    - Name
    - Description
    - Cover
- Publication info
    - Authors (relation -> Person)
    - Publication date
    - Published in (relation -> Project)
    - DOI
    - Web URL
- Content
    - Quotes (relation -> Quote)
    - Claims (relation -> Claim)
    - Abstract
- Classification
    - Related topics (relation -> Topic)
    - Tags (relation -> Tag)

Additional properties (TODO, proposal):
- Model (relation -> Model)
- Dataset (relation -> Dataset)
- Code URL

## Model (TODO, proposal)

Model type in the AI space should probably be updated and changed a little bit.

- Name
- Version
- Description
- Type
- Architecture
- Web URL
- Code URL
- Release date
- License
- Paper (relation -> Paper)

## Dataset (TODO, proposal)

Dataset type in the AI space should probably be updated and changed a little bit.

- Name
- Version
- Description
- Type
- Web URL
- Code URL
- Release date
- License
- Paper (relation -> Paper)
