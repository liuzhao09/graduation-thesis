# 毕业论文项目说明

本仓库用于维护当前毕业论文的 LaTeX 源码。  
论文内容以编译后的 `main.pdf` 为准。

## 内容入口

- 论文主文件：`main.tex`
- 参考文献库：`reference.bib`
- 编译输出：`main.pdf`

## 章节文件对应

- 第一章：`docs/chap01.tex`
- 第二章：`docs/chap02.tex`
- 第三章：`docs/chap03.tex`
- 第四章：`docs/chap04.tex`
- 第五章：`docs/chap05.tex`

## 编译命令

```bash
latexmk -xelatex main.tex
```

## 说明

- 本项目 README 不再保留模板历史介绍。
- 若需查看完整正文，请直接打开 `main.pdf`。
