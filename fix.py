with open("docs/eng_toc_entries.tex", "w") as f:
    f.write(r"
ewcommand{\enline}[3]{
oindent\hspace*{#1}#2\leaders\hbox to .45em{\hss.\hss}\hfill #3\par}" + "
")
    f.write("
")
    f.write(r"\enline{0em}{	extbf{Abstract (In Chinese)}}{I}" + "
")
    f.write(r"\enline{0em}{	extbf{Abstract (In English)}}{III}" + "
")
    f.write(r"\enline{0em}{	extbf{List of Abbreviations}}{IX}" + "
")
    f.write("
")
    f.write(r"\enline{0em}{	extbf{Chapter 1 Introduction}}{1}" + "
")
    f.write(r"\enline{1.8em}{Section 1.1 Research Background and Significance}{1}" + "
")
    f.write(r"\enline{1.8em}{Section 1.2 Domestic and International Research Status}{2}" + "
")
    f.write(r"\enline{1.8em}{Section 1.3 Research Questions and Core Challenges}{4}" + "
")
    f.write(r"\enline{1.8em}{Section 1.4 Research Route and Main Contributions}{5}" + "
")
    f.write(r"\enline{1.8em}{Section 1.5 Thesis Organization}{7}" + "
")
    f.write("
")
    f.write(r"\enline{0em}{	extbf{Chapter 2 Problem Definition and Modeling Principles}}{8}" + "
")
    f.write(r"\enline{1.8em}{Section 2.1 Task Definition and Notation}{8}" + "
")
    f.write(r"\enline{1.8em}{Section 2.2 Modeling Boundaries and Evaluation Protocol}{9}" + "
")
    f.write(r"\enline{1.8em}{Section 2.3 Research Gaps and Modeling Principles}{10}" + "
")
    f.write(r"\enline{1.8em}{Section 2.4 Research Question Mapping}{11}" + "
")
    f.write("
")
    f.write(r"\enline{0em}{	extbf{Chapter 3 Collaborative Learning Method of Large and Small Models}}{13}" + "
")
    f.write(r"\enline{1.8em}{Section 3.1 Chapter Introduction}{13}" + "
")
    f.write(r"\enline{1.8em}{Section 3.2 Overall Framework and Design Motivation}{13}" + "
")
    f.write(r"\enline{1.8em}{Section 3.3 Key Module Design}{15}" + "
")
    f.write(r"\enline{3.6em}{Subsection 3.3.1 Small-model Branch, TSPM}{15}" + "
")
    f.write(r"\enline{3.6em}{Subsection 3.3.2 Large-model Branch, GA-LLM}{21}" + "
")
    f.write(r"\enline{1.8em}{Section 3.4 Alignment and Collaborative Training Strategy}{28}" + "
")
    f.write(r"\enline{1.8em}{Section 3.5 Method Comparison and Discussion}{33}" + "
")
    f.write(r"\enline{1.8em}{Section 3.6 Chapter Summary}{34}" + "
")
    f.write("
")
    f.write(r"\enline{0em}{	extbf{Chapter 4 Experimental Design and Result Analysis}}{35}" + "
")
    f.write(r"\enline{1.8em}{Section 4.1 Chapter Introduction}{35}" + "
")
    f.write(r"\enline{1.8em}{Section 4.2 Experimental Objectives and Research Questions}{35}" + "
")
    f.write(r"\enline{1.8em}{Section 4.3 Experimental Setup}{35}" + "
")
    f.write(r"\enline{1.8em}{Section 4.4 Main Results and Dual-route Baseline Comparison (RQ1)}{38}" + "
")
    f.write(r"\enline{1.8em}{Section 4.5 Mechanism Verification and Diagnostic Analysis (RQ2--RQ4)}{41}" + "
")
    f.write(r"\enline{1.8em}{Section 4.6 Efficiency and Scalability Analysis (RQ5)}{48}" + "
")
    f.write(r"\enline{1.8em}{Section 4.7 Chapter Summary}{51}" + "
")
    f.write("
")
    f.write(r"\enline{0em}{	extbf{Conclusion}}{52}" + "
")
    f.write(r"\enline{0em}{	extbf{References}}{57}" + "
")
    f.write(r"\enline{0em}{	extbf{Appendix}}{62}" + "
")
    f.write(r"\enline{0em}{	extbf{Acknowledgements}}{63}" + "
")
