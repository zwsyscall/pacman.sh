# exec
Loaders are fun to write but annoying to make modular and/or easily buildable.

I spent some time making a modular `jinja2` powered loader, [zloader](https://github.com/zwsyscall/zloader). At the time of writing, it's ![FUD](images/hackerman.gif) and will probably remain FUD unless someone picks it up for malicious purposes or rust detections get better.

I always feel kind of divided on releasing these projects. On one hand, it's a fun project and it's nice to share what I've made, even if it's simple. On the other, I'm sure I'll get someone asking for help with obviously illegal intentions which makes me feel uneasy. This time I chose a somewhat middle-ground where if you don't understand the code and use it "as a skid", it'll watermark the final build with some information about you. In a similar vein, this is a toned down, quite lobotomized version of the same private project. I feel at least a little bit better about releasing it this way.

I previously attempted a similar project by only depending on `cargo` features and very bloated [`cfg_if!`](https://docs.rs/cfg-if/latest/cfg_if/) chaining. As I'm sure is a surprise to nobody, this was horrible and difficult to maintain and developt further. The new `jinja2` driven development path feels a lot better, not only does it keep the actual source code readable but it also makes adding modules *so* much easier. I'm very happy with this choice and will probably stick with `jinja2` until something better comes my way.

Right now the build process relies on a python script, it'd be nice to somehow tie in the jinja2 templating to the actual `cargo build` process, but I did not find a compiler plugin and did not feel like writing one, not that I would know how to to begin with!
