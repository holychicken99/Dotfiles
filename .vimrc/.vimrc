syntax enable
hi Normal guibg=NONE ctermbg=NONE
"set background=dark
call plug#begin('~/.vim/plugged')
"Plug 'morhetz/gruvbox'
Plug 'HenryNewcomer/vim-theme-papaya'
Plug 'rust-lang/rust.vim'
Plug 'vim-scripts/Rainbow-Parenthesis'
Plug 'lyuts/vim-rtags'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'preservim/nerdtree'
Plug 'vim-utils/vim-man'
Plug 'ghifarit53/tokyonight-vim'
Plug 'kaicataldo/material.vim', { 'branch': 'main' }
Plug 'artanikin/vim-synthwave84'
Plug 'cdelledonne/vim-cmake'
call plug#end()
map <F5> :NERDTreeToggle<CR>
" Set compatibility to Vim only.
set nocompatible
autocmd VimEnter * NERDTree | wincmd p
" Helps force plug-ins to load correctly when it is turned back on below.
filetype on  
set cursorline
" Turn on syntax highlighting.
syntax enable
filetype plugin indent on
nnoremap <C-Left> :tabprevious<CR>                                                                            
nnoremap <C-Right> :tabnext<CR>
nnoremap <C-j> :tabprevious<CR>                                                                            
nnoremap <C-k> :tabnext<CR>
filetype plugin indent on
nmap <F6> :NERDTreeToggle<CR>
set termguicolors

let g:tokyonight_style = 'night' " available: night, storm
let g:tokyonight_enable_italic = 1


" Turn off modelines
set modelines=0

" Automatically wrap text that extends beyond the screen length.
set wrap
set relativenumber
" Uncomment below to set the max textwidth. Use a value corresponding to the width of your screen.
" set textwidth=79
set formatoptions=tcqrn1
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab
set noshiftround
set smartindent
" Display 5 lines above/below the cursor when scrolling with a mouse.
set scrolloff=5
" Fixes common backspace problems
set backspace=indent,eol,start

" Speed up scrolling in Vim
set ttyfast

" Status bar
set backspace=indent,eol,start
set title
set incsearch
set autoindent
set ruler
set autowrite
set smarttab
set linebreak
set spell
set et
" Display options
set showmode
set showcmd

" Highlight matching pairs of brackets. Use the '%' character to jump between them.
set matchpairs+=<:>

" Display different types of white spaces.
set list
set listchars=tab:›\ ,trail:•,extends:#,nbsp:.

" Show line numbers
set number

" Set status line display
set statusline=%F%m%r%h%w\ [FORMAT=%{&ff}]\ [TYPE=%Y]\ [POS=%l,%v][%p%%]\ [BUFFER=%n]\ %{strftime('%c')}

" Encoding
set encoding=utf-8

" Highlight matching search patterns
set hlsearch
" Enable incremental search
set incsearch
" Include matching uppercase words with lowercase search term
set ignorecase
" Include only uppercase words with uppercase search term
set smartcase
colorscheme material 
let g:material_terminal_italics = 1
let g:material_theme_style = 'ocean'
set term=xterm-256color
"set term=screen-256color
if has('termguicolors')
   set termguicolors
endif
set background=dark

" Store info from no more than 100 files at a time, 9999 lines of text, 100kb of data. Useful for copying large amounts of data between files.
set viminfo='100,<9999,s100
set autoindent
" Map the <Space> key to toggle a selected fold opened/closed.
set rtp+=~/Downloads/tabnine-vim
" Automatically save and load folds
hi Normal guibg=NONE ctermbg=NONE
