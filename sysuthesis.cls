% 定义模板样式
\NeedsTeXFormat{LaTeX2e}[1995/12/01]
\ProvidesClass{sysuthesis}[2017/05/06 v4.5.3 Sun Yat-Sen University undergraduate thesis document class]
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{ctexbook}}
\ProcessOptions\relax

\LoadClass[
    %fontset=adobe,
    %fontset=fandol,    % texlive自带，可移植字体库，只有常用的6763个汉字
    %fontset=ubuntu,
    %fontset=mac,
    fontset=mac,
    a4paper,
    %openright,
    openany,
    zihao=-4
]{ctexbook}

\def\@printtwoside{0} % 设置文章为电子版格式（不添加多余空白页）

% 配置英文字体
\RequirePackage{fontspec}
\setmainfont{Times New Roman}

\RequirePackage{fancyhdr}
\RequirePackage[top=1in, bottom=1in, left=1.25in, right=1.25in, headsep=0.2in, headheight=0.532cm, footskip=0.79cm]{geometry}
\RequirePackage{booktabs}
\RequirePackage{calc}
\RequirePackage{graphicx}
\RequirePackage{svg}
\RequirePackage[labelsep=space, justification=centering]{caption}
\RequirePackage{float}
\RequirePackage[font=footnotesize]{subcaption}
\RequirePackage{amsmath,amssymb,amsthm}
\RequirePackage{listings}
\RequirePackage{longtable}
\RequirePackage[section]{placeins}
\RequirePackage{enumitem}
\RequirePackage{bbm}
\RequirePackage{bm}
\RequirePackage[notlof,notlot,nottoc,numbib]{tocbibind} %table of content
\RequirePackage{tocloft}
\RequirePackage{wrapfig}
\RequirePackage{colortbl}
\RequirePackage{xcolor}
\RequirePackage{array}
\RequirePackage{multirow}
\RequirePackage{makecell}
\RequirePackage[bottom, perpage]{footmisc}
\RequirePackage{setspace}
\RequirePackage{datetime}
\RequirePackage{nth}
% 引入调整段落整体宽度的宏包
\RequirePackage{changepage}
\RequirePackage{emptypage}
\RequirePackage{ulem}

% Insert a TRUE blank page which has no header or footer
\let\origdoublepage\cleardoublepage
\newcommand{\clearemptydoublepage}{
    \clearpage{
        \pagestyle{empty}
        \origdoublepage
    }
}
% 定义了一种新的clearpage方式，允许一个变量切换电子版及双面打印版
\newcommand{\newclearpage}{
    \if\@printtwoside1
        \clearemptydoublepage
    \else
        \clearpage
    \fi
}

% 设定时间为中文日期
\ctexset{today=small}

% 定义英文日期格式
\newcommand\etoday{
  \hspace{0.5\ccwd} \monthname[\the\month]\hspace{2\ccwd} \nth{\the\day}{\hspace{1\ccwd}} \the\year
}

\AtBeginDocument{
    \hypersetup{
        citecolor=green,
        filecolor=black,
        linkcolor=black,
        urlcolor=black,
        CJKbookmarks=true,
        pdftitle={\@ctitle},
        pdfauthor={\@cauthor},
        pdfkeywords={\@ckeywords},
        pdfcreator={LaTeX with hyperref package, using SYSU undergraduate Thesis LaTeX Template}
    }
}
\pagestyle{fancy}

% 有序与无序列表环境
\setlist[enumerate]{nosep}
\renewcommand\labelenumi{\theenumi)}
\setlist[itemize]{nosep}
\setlist[description]{nosep}

% 页眉、页脚、脚注设定
\definecolor{SYSUHeaderGray}{gray}{0.45}
\renewcommand{\footrulewidth}{0pt}
% 页眉显示与章节标题一致：有章号时显示“第X章 标题”，无章号时仅显示标题
\renewcommand{\chaptermark}[1]{%
    \if@mainmatter
        \ifnum\value{chapter}>0
            \markboth{第\thechapter{}章 #1}{}
        \else
            \markboth{#1}{}
        \fi
    \else
        \markboth{#1}{}
    \fi
}
% 采用带圈数字符号代替*号脚注
\xeCJKsetcharclass{`①}{`⑩}{1}

% 后续普通页：仅细线，无文字
\fancypagestyle{thesisnormal}{
    \fancyhf{}
    \fancyfoot[C]{\zihao{-5}\thepage}
    \fancyhead[C]{}
    \renewcommand{\headrulewidth}{0.4pt}
    \renewcommand{\footrulewidth}{0pt}
}

% 章节首页：灰色标题 + 上粗下细双线
\fancypagestyle{chapterstart}{
    \fancyhf{}
    \fancyfoot[C]{\zihao{-5}\thepage}
    \fancyhead[C]{\zihao{-5}\textcolor{SYSUHeaderGray}{\leftmark}}
    \renewcommand{\headrule}{%
        \hrule\@height 1.2pt\@width\headwidth
        \vskip 0.8pt
        \hrule\@height 0.2pt\@width\headwidth
        \vskip -2.0pt
    }
    \renewcommand{\footrulewidth}{0pt}
}

% book类章节首页默认调用plain样式，映射为章节首页样式
\fancypagestyle{plain}{\fancyhf{}\fancyfoot[C]{\zihao{-5}\thepage}\fancyhead[C]{\zihao{-5}\textcolor{SYSUHeaderGray}{\leftmark}}\renewcommand{\headrule}{\hrule\@height 1.2pt\@width\headwidth\vskip 0.8pt\hrule\@height 0.2pt\@width\headwidth\vskip -2.0pt}\renewcommand{\footrulewidth}{0pt}}
\pagestyle{thesisnormal}

% 中英文摘要页面样式：双线页眉、无文字
\fancypagestyle{cAbstract}{
    \fancyhf{}
    \fancyfoot[C]{\zihao{-5}\thepage}
    \fancyhead[C]{}
    \renewcommand{\headrule}{%
        \hrule\@height 1.2pt\@width\headwidth
        \vskip 0.8pt
        \hrule\@height 0.2pt\@width\headwidth
        \vskip -2.0pt
    }
    \renewcommand{\footrulewidth}{0pt}
}
\fancypagestyle{eAbstract}{
    \fancyhf{}
    \fancyfoot[C]{\zihao{-5}\thepage}
    \fancyhead[C]{}
    \renewcommand{\headrule}{%
        \hrule\@height 1.2pt\@width\headwidth
        \vskip 0.8pt
        \hrule\@height 0.2pt\@width\headwidth
        \vskip -2.0pt
    }
    \renewcommand{\footrulewidth}{0pt}
}

% 表格与图片标题设定
\renewcommand{\thefigure}{\thechapter-\arabic{figure}}
\renewcommand{\thetable}{\arabic{chapter}-\arabic{table}}
\setlength\heavyrulewidth{1.5pt}
\captionsetup{font=small,format=hang}
\DeclareCaptionFont{sysutablefont}{\zihao{5}\songti\rmfamily}
\captionsetup[table]{font=sysutablefont,format=hang}
\AtBeginEnvironment{table}{\zihao{5}\songti\rmfamily}
\AtBeginEnvironment{table*}{\zihao{5}\songti\rmfamily}
\AtBeginEnvironment{longtable}{\zihao{5}\songti\rmfamily}
% 公式标题设定
\renewcommand{\theequation}{\arabic{chapter}-\arabic{equation}}

% 目录设定，使用tocloft宏包
\setcounter{secnumdepth}{3} % depth of toc, 2
\setcounter{tocdepth}{2}
% 如果要在目录中显示子章节请换用下面这行(目录中显示到x.y.z章)，如果不用这行默认显示到x.y章。
% \setcounter{tocdepth}{2}

% 目录标题：3号宋体加粗
\renewcommand{\cfttoctitlefont}{\hfill\zihao{3}\songti\bfseries}
\renewcommand{\cftlottitlefont}{\hfill\zihao{3}\songti\bfseries}
\renewcommand{\cftloftitlefont}{\hfill\zihao{3}\songti\bfseries}

% 目录中章节标题：四号黑体
\renewcommand{\cftchapfont}{\zihao{4}\heiti}
\renewcommand{\cftchappagefont}{\zihao{4}\heiti}

% 目录中其他内容：小四号宋体
\renewcommand{\cftsecfont}{\zihao{-4}\songti}
\renewcommand{\cftsecpagefont}{\zihao{-4}\songti}
\renewcommand{\cftsubsecfont}{\zihao{-4}\songti}
\renewcommand{\cftsubsecpagefont}{\zihao{-4}\songti}
\setlength{\cftsecindent}{2.3em}        % 小节缩进, 对齐章标题空隙

\renewcommand{\cftaftertoctitle}{\hfill}
\renewcommand{\cftafterlottitle}{\hfill}
\renewcommand{\cftafterloftitle}{\hfill}
\renewcommand{\cftnodots}{\cftdotsep}     % 使用点指示页数

\addtolength{\cftchapnumwidth}{3\ccwd}
\newcommand\mybold[1]{\textit{\textbf{#1}}}

\newcommand{\norm}[1]{\left\lVert#1\right\rVert}
\newtheoremstyle{dotless}{3pt}{3pt}{\kaishu}{2em}{\heiti}{}{\ccwd}{}
\theoremstyle{dotless}
\newtheorem{theorem}{{定理}}[chapter]
\newtheorem{proposition}{{命题}}[chapter]
\newtheorem{lemma}{{引理}}[chapter]
\newtheorem{corollary}{{推论}}[chapter]
\newtheorem{definition}{{定义}}[chapter]
\newtheorem{remark}{{注记}}[chapter]
\newtheorem{eg}{例}[chapter]

\renewcommand{\proofname}{{\heiti 证明}}
\renewcommand{\@biblabel}[1]{[#1]\hfill}

\renewenvironment{proof}[1][\proofname]{\par
    \pushQED{\qed}
    \kaishu \topsep6\p@\@plus6\p@\relax
    \trivlist
    \item[\hskip\labelsep
                \itshape
        #1]\ignorespaces
}{
    \popQED\endtrivlist\@endpefalse
}

% 相关信息宏定义
\newcommand\ctitle[1]{\def\@ctitle{#1}}
\newcommand\etitle[1]{\def\@etitle{#1}}
\newcommand\covertitlefirst[1]{\def\@covertitlefirst{#1}}
\newcommand\covertitlesecond[1]{\def\@covertitlesecond{#1}}
\newcommand\covertitlethird[1]{\def\@covertitlethird{#1}}
\newcommand\cauthor[1]{\def\@cauthor{#1}} % 默认中文名为封面作者名字
\newcommand\eauthor[1]{\def\@eauthor{#1}}
\newcommand\cmajor[1]{\def\@cmajor{#1}}
\newcommand\emajor[1]{\def\@emajor{#1}}
\newcommand\cmentor[1]{\def\@cmentor{#1}}
\newcommand\ementor[1]{\def\@ementor{#1}}
\newcommand\ccollege[1]{\def\@ccollege{#1}}
\newcommand\cdegree[1]{\def\@cdegree{#1}}
\def\@ccollege{中山大学人工智能学院}
\def\@cdegree{硕士}

\newlength{\@title@width}
\newlength{\@title@signblockwidth}

\renewcommand\maketitle {
    \begin{titlepage}
        \begin{center}
            \songti
            \zihao{3}\bfseries\@ccollege\\[8pt]
            \zihao{2}\bfseries 研究生学位论文\\[5em]

            \zihao{3}\songti\@covertitlefirst\\[10pt]
            \zihao{-4}\rmfamily\@covertitlesecond\\[4em]

            \begin{tabular}{ll}
                \zihao{4}学位申请人： & \zihao{4}\@cauthor \\
                \zihao{4}专业名称： & \zihao{4}\@cmajor \\
                \zihao{4}导师姓名及职称： & \zihao{4}\@cmentor \\
                \zihao{4}学位： & \zihao{4}\@cdegree \\
            \end{tabular}

            \vfill

            \setlength{\@title@width}{8cm}
            \setlength{\@title@signblockwidth}{\textwidth}
            \zihao{4}\songti
            \begin{tabular*}{\@title@signblockwidth}{@{\extracolsep{\fill}}lr}
                答辩委员会主席（签名）： & \underline{\makebox[\@title@width][c]{~}}\\[20pt]
                委员（签名）： & \underline{\makebox[\@title@width][c]{~}}
            \end{tabular*}

        \end{center}
    \end{titlepage}
    \newclearpage
}


\newcommand\etitlefirst[1]{\def\@etitlefirst{#1}}
\newcommand\etitlesecond[1]{\def\@etitlesecond{#1}}


\newcommand\makedisclaim{
    \ctexset {
        chapter = {
%            titleformat = {\zihao{-2}\fangsong\bfseries},
			titleformat = {\zihao{-2}\heiti},
            beforeskip = {10pt},
            afterskip = {30pt}
        }
    }
    \input{docs/disclaim}
    \thispagestyle{empty}
    \newclearpage
}

% 摘要
\newcommand\ckeywords[1]{\def\@ckeywords{#1}}
\newcommand\ekeywords[1]{\def\@ekeywords{#1}}
\newcommand\cabstract[1]{\def\@cabstract{#1}}
\newcommand\eabstract[1]{\def\@eabstract{#1}}

% 中文摘要、关键字标题：5号黑体并加方括号
% 中文摘要、关键字内容：5号楷体

\newcommand\makecabstract{
	\ctexset{
		section = {
			titleformat = {\zihao{4}\heiti},
			beforeskip = {10pt},
			afterskip = {20pt}
		},
		paragraph/format = {}
	}
	
	\addcontentsline{toc}{chapter}{摘\hspace{\ccwd}要}
    \phantomsection\label{abs-cn}
	\begin{center}
		\zihao{3}
		\mbox{ }\\
		\textbf{论文题目：\@ctitle} 
		\vspace{\baselineskip}\\
		\zihao{-3}
		\begin{tabular}{l}
			专\hspace{2\ccwd}业：\@cmajor \\
			硕\hspace{0.5\ccwd}士\hspace{0.5\ccwd}生：\@cauthor \\
			指导教师：\@cmentor
		\end{tabular}
		\vspace{\baselineskip}\\ 
		\zihao{-2}\heiti\textbf{摘要}
	\end{center}		
		\begin{spacing}{1.5}
			\zihao{-4} \songti\@cabstract
			~\\
		\end{spacing}
	\zihao{-4}\textbf{关键词：}\@ckeywords
		%\paragraph{\zihao{-4}\textbf{关键词：}\@ckeywords}
}

% 英文摘要、关键字标题：小四号新罗马体(Time New Roman)加粗并加方括号
% 英文摘要、关键字内容：小四号新罗马体(Time New Roman)
\newcommand\makeeabstract{
	\ctexset{
		section = {
			titleformat = {\zihao{4}\textbf},
			beforeskip = {10pt},
			afterskip = {20pt}
		}
	}
	
	\addcontentsline{toc}{chapter}{ABSTRACT}
    \phantomsection\label{abs-en}
	
		\begin{center}
			\zihao{-3}
			\mbox{ }\\
			\textbf{Title: \@etitle} 
			\vspace{\baselineskip}\\
		\zihao{-3}
		\begin{tabular}{ll}
			Major: \@emajor \\
			Name: \@eauthor \\
			Supervisor: \@ementor
		\end{tabular}
		\vspace{\baselineskip}\\
			\zihao{-3} \textbf{Abstract}
		\end{center}
			\begin{spacing}{1.5}
				\zihao{-4} \@eabstract
				~\\
			\end{spacing}
	\begin{spacing}{1.5}
		\noindent\zihao{-4}\textbf{Keywords: }\@ekeywords
	\end{spacing}
		%\paragraph{\textbf{Keywords: }}\zihao{-4}\indent \@ekeywords
}

\newcommand\makeabstract{
    \setcounter{page}{1}
    \makecabstract
    \thispagestyle{cAbstract}
    \newclearpage

    \makeeabstract
    \thispagestyle{eAbstract}
    \newclearpage
}
\newcommand\maketableofcontents{
    \pagestyle{thesisnormal}
    \tableofcontents
    \newclearpage
}

\newcommand\cacheenglishtoc{
    \global\let\sysuen@tocdata\@empty
    \begingroup
    \def\contentsline##1##2##3##4{%
        \g@addto@macro\sysuen@tocdata{%
            \noexpand\sysuen@entry{##1}{##2}{##3}{##4}%
        }%
    }%
    \InputIfFileExists{\jobname.toc}{}{}%
    \endgroup
}

\newcommand\makeenglishtableofcontents{
    \begingroup
    \chapter*{Contents}
    \markboth{Contents}{}
    \thispagestyle{chapterstart}
    \pagestyle{thesisnormal}
    \zihao{-4}\songti
    \setlength{\parindent}{0pt}
    \InputIfFileExists{docs/eng_toc_entries.tex}{}{}
    \endgroup
    \newclearpage
}

\renewcommand\mainmatter{
    \@mainmattertrue
    \pagenumbering{arabic}
    \ctexset {
        chapter = {
            %fixskip = true,
            beforeskip = {0pt},
            afterskip = {16.5pt},
            format = {\centering},
            number = {\arabic{chapter}},
            name = {第,章},
            nameformat = {\zihao{-2}\heiti},
            titleformat = {\zihao{-2}\heiti}
        },
        section = {
            %fixskip = true,
            beforeskip = {13pt},
            afterskip = {13pt},
            format = {},
%            nameformat = {\zihao{-3}\songti\bfseries},
%            titleformat = {\zihao{-3}\songti\bfseries}
            nameformat = {\zihao{-3}\heiti},
            titleformat = {\zihao{-3}\heiti}
        },
        subsection = {
            %fixskip = true,
            beforeskip = {10pt},
            afterskip = {10pt},
            format = {},
%            nameformat = {\zihao{-4}\songti\bfseries},
%            titleformat = {\zihao{-4}\songti\bfseries}
            nameformat = {\zihao{-4}\heiti},
            titleformat = {\zihao{-4}\heiti}
        },
        subsubsection = {
            beforeskip = {10pt},
            afterskip = {10pt},
            format = {},
%            nameformat = {\zihao{-4}\songti\bfseries},
%            titleformat = {\zihao{-4}\songti\bfseries}
            nameformat = {\zihao{-4}\heiti},
            titleformat = {\zihao{-4}\heiti}
            % 按照中大规定的格式需要显示成a.b.c.d章，而不是(d)节
            % number = {(\arabic{subsubsection})}
        }
    }

    \zihao{-4}\songti \linespread{1.5}\selectfont
    \pagestyle{thesisnormal}
}

\renewcommand\backmatter{
    \@mainmatterfalse
    \pagestyle{thesisnormal}
}

% 参考文献
% 参考文献引用标记格式：右上角，带方括号
\RequirePackage[comma,square,super]{natbib}
% 标题与正文章节标题相同
% 内容小五号宋体
\newcommand\makereferences{
    \begingroup
        \ctexset {
            chapter = {
%                aftertitle = {：},
                format = {\centering},
%                format = {},
                titleformat = {\zihao{-2}\heiti}
            }
        }
    \endgroup
}

\newcommand\Nchapter[1]{%
	\if@mainmatter%
	\@mainmatterfalse%
	\chapter{#1}%
	\@mainmattertrue%
	\else
	\chapter{#1}%
	\fi}
\def\SYSU@label@publications{攻读硕士学位期间取得的研究成果}
\newenvironment{publications}[1]
{\heiti\Nchapter{\SYSU@label@publications}%
	\@mkboth{\MakeUppercase\SYSU@label@publications}
	{\MakeUppercase\SYSU@label@publications}%
	\list{\@biblabel{\@arabic\c@enumiv}}%
	{\settowidth\labelwidth{\@biblabel{#1}}%
		\leftmargin\labelwidth
		\advance\leftmargin\labelsep
		\@openbib@code
		\usecounter{enumiv}%
		\let\p@enumiv\@empty
		\renewcommand\theenumiv{\@arabic\c@enumiv}}%
	\sloppy
	\clubpenalty4000
	\@clubpenalty \clubpenalty
	\widowpenalty4000%
	\sfcode`\.\@m}
{\def\@noitemerr
	{\@latex@warning{Empty `publications' environment}}%
	\endlist}

% 附录样式
\renewcommand\appendix{\par
    \@mainmattertrue
    \pagestyle{thesisnormal}
    \setcounter{chapter}{0}
    \setcounter{section}{0}
    \gdef\@chapapp{\appendixname}
    \gdef\thechapter{\@Alph\c@chapter}
    \gdef\CTEX@prechapter{\CTEX@preappendix}
    \gdef\CTEX@thechapter{\CTEX@appendix@number}
    \gdef\CTEX@postchapter{}
    \ctexset {
        chapter = {
            format = {\centering},
            nameformat = {\zihao{-2}\heiti},
            titleformat = {\zihao{-2}\heiti},
        },
        section = {
            format = {\centering},
            nameformat = {\zihao{-3}\heiti},
            titleformat = {\zihao{-3}\heiti}
        },
        subsection = {
            format = {\centering},
            nameformat = {\zihao{-4}\heiti},
            titleformat = {\zihao{-4}\heiti}
        }
    }
}


% 配置超链接。
% hyperref一般要求是导言区最后一个宏包，才能正常工作
% 若把该宏包提前，则会引起附录列表跳转到第一章的问题
\RequirePackage[hidelinks, hyperfootnotes=true]{hyperref}
\RequirePackage{footnotebackref}

\renewcommand{\@fnsymbol}[1]{
    \ifcase#1\or \text{①}\or \text{②}\or \text{③}\or    \text{④}\or \text{⑤}\or \text{⑥}\or \text{⑦}\or \text{⑧} \or \text{⑨} \or \text{⑩}
    \else
        \@ctrerr
    \fi
}
\renewcommand{\thefootnote}{\fnsymbol{footnote}}
