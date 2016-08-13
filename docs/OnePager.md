**Problem:** There are no existing development environments which enable an effective *workflow* for analyzing *modern data*. 

- Algorithms and numerical methods for data analysis, machine learning, and artificial intelligence have matured substantially over the past decade, at the cost of increased complexity.
- Datasets are becoming increasingly larger and more heterogeneous
- Hardware capabilities have matured as well, but "human hardware" has not.
- "Human-usable" tools and software for applying said algorithms *have not* matured to any substantial degree in the last decade. Most existing tools were built to suit the needs of academic and corporate circles as far back as the 1980s.
- The result is a stubling-block: human time and effort required to analyze, model, and represent data has gotten worse, not better.  

 
**Solution**

Reduce *incidental complexity* without sacrificing *expressibility* through a workflow centered core principls and patterns:

- Separate state from mutation
- Pipeline-centric workflow: Program is sequence a series of discrete stages.
  - Each stage takes data as input, produces data as output
- Agnostic to Where the Data Resides
- Reactive workflow
- Evaluate code in-place
- Formatted documentation inline
- Repeatability / Communicability / Verifiability
  

- Opinionated, pattern based workflow

**What is "modern data"?**

Loosely speaking, a collection of data that wouldn't be reasonably stored as a single file on a workstation. 

- Typically stored and accessed via a database, API, or "cloud" service such as S3
- Comes in many different schemes and formats: Relational, JSON, Markup, raw text 
- Often distributed either

Core responsibilities:

- Data Acquisition
- Data manipulation and modeling
- Data Visualization and Business Intelligence

1. Data Acquisition
- Connect/Authenticate
- Collect/Aquire/Scrape

- Data manipulation and modeling
- Data Visualization and Business Intelligence

The current data analysis ecosystem:

- Two camps: academic and corporate 

# Academic
- Matlab
- Jupyter (Python)
- Spyder (Python)
- RStudio



# "Interactive Python" ipython
# RStudio

# Corporate
- Excel
- SAS
- SPSS