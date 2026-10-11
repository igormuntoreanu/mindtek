module.exports = function () {
	var mPaths = {
		"/about": "/index.html",
		"/about/": "/index.html",
		"/people": "/index.html",
		"/people/": "/index.html",
		"/work": "/index.html",
		"/work/": "/index.html",
		"/portfolio": "/index.html",
		"/portfolio/": "/index.html",
		"/contact": "/index.html",
		"/contact/": "/index.html"
	};

	return function (req, res, next) {
		if (mPaths[req.path]) {
			req.url = mPaths[req.path];
		}
		next();
	};
};
