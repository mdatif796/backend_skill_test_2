module.exports.setFlash = function(req, res, next){
    // setting the flash messages to the locals
    res.locals.flash = {
        'success': req.flash('success'),
        'error': req.flash('error')
    }
    return next();
}