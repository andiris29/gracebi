(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisContainer.supportClasses.ShelfBase');

    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var ValueType = grace.constants.ValueType;
    var NumberValue = grace.models.value.NumberValue;
    var DateValue = grace.models.value.DateValue;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent;
    var Analysis = grace.models.vo.Analysis;
    var ShelfType = grace.constants.ShelfType;
    var PopUpMenu = grace.views.popUp.menu.PopUpMenu;
    var OperationGroupProxy = grace.views.popUp.menu.dataProvider.OperationGroupProxy;
    var AnalysesProxy = grace.views.popUp.menu.dataProvider.AnalysesProxy;
    var PopUpEvent = grace.views.popUp.PopUpEvent;
    var OperationFactory = grace.operation.OperationFactory;
    var MenuEvent = grace.views.popUp.menu.MenuEvent;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;
    var OperationType = grace.operation.OperationType;
    var QuantifiedHelper = grace.models.value.supportClasses.QuantifiedHelper;

    var TextFilter = grace.filter.TextFilter;
    var FilterUtil = grace.utils.FilterUtil;
    var TextValuesProxy = grace.views.popUp.filter.dataProvider.TextValuesProxy;
    var PopUpTextFilter = grace.views.popUp.filter.PopUpTextFilter;
    var RangeFilter = grace.filter.RangeFilter;
    var RangeValuesProxy = grace.views.popUp.filter.dataProvider.RangeValuesProxy;
    var PopUpRangeFilter = grace.views.popUp.filter.PopUpRangeFilter;
    var FilterEvent = grace.views.popUp.filter.FilterEvent;

    var ShelfBase = grace.views.analysisContainer.supportClasses.ShelfBase = function(dom) {
        ShelfBase.superclass.constructor.apply(this, arguments);

        var _this = this;
        // Place holder for card dragging
        this._$ph = $('<div/>').addClass('grace-analysis-card_placeholder');
        //
        this._popUpMenu = null;
        this._popUpFilter = null;
        this._trashMenu = null;
        /**
         * @protected
         */
        this._type = null;
        this._layout = null;
        this._initialization();

        this.helperGetAnalysis = null;

        $(this._dom).css({
            // 'width' : 160 + 'px'
        }).addClass('grace-analysis-contaier');

        this._$trashBin = null;
        this._$cards = null;

        var $container;
        // Title
        $container = $(this._dom);
        $container = $('<div/>').appendTo($container).addClass('grace-analysis-titleArea grace-analysis-clearfix');
        $container = $('<div/>').appendTo($container).addClass('grace-analysis-title');
        $('<h2/>').appendTo($container).addClass('grace-analysis-title-text');
        if (ShelfType.src(this._type)) {
            this._$trashBin = $('<span/>').appendTo($container).attr('title', '移回');
            this._$trashBin.addClass(['grace-analysis-operation', 'grace-analysis-title-operation', 'grace-analysis-title-operation-recycleBin'].join(' '));
        }

        // Content Cards
        $container = $(this._dom);
        $container = $('<div/>').appendTo($container).addClass('grace-analysis-cardArea');
        var $cards = this._$cards = $('<div/>').appendTo($container).addClass('grace-analysis-cards fancy-scrollbar');
        if (this._layout === 'horizontal') {
            $cards.addClass('grace-analysis-cards-horizontal');
        }
        if (_this._layout === 'vertical') {
            $('<div/>').appendTo($container).addClass('grace-analysis-cardArea-gradientTop');
            $('<div/>').appendTo($container).addClass('grace-analysis-cardArea-gradientBottom');
        }

        //
        $(this._dom).droppable({
            tolerance : 'pointer',
            accept : function(helper) {
                var from = helper.attr('__shelfType');
                var to = _this._type;

                var a = _this.helperGetAnalysis(helper.attr('__analysisID'));

                if (ShelfType.src(to)) {
                    if (to === ShelfType.SRC_MEA) {
                        if (ShelfType.src(from) && a.valueType() === ValueType.NUMBER) {
                            return true;
                        }
                    } else {
                        if (ShelfType.src(from)) {
                            return true;
                        }
                    }
                } else if (ShelfType.des(to)) {
                    if (to === ShelfType.DES_DIM) {
                        if (a.analysisType === AnalysisType.DIMENSION) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else if (ShelfType.proc(to)) {
                    return true;
                }
                return false;
            },
            activate : function(event) {
                var helper = $(event.currentTarget);
                var from = helper.attr('__shelfType');
                var to = _this._type;

                if (from !== to) {
                    $(this).addClass('grace-analysis-contaier_dropAcceptable');
                }
            },
            deactivate : function(event) {
                $(this).removeClass('grace-analysis-contaier_dropAcceptable');

                _this._$ph.detach();
            },
            drop : function(event, ui) {
                var from = ui.helper.attr('__shelfType');
                var to = _this._type;

                _this._$ph.detach();
                ui.helper.attr('__toContainerType', to);

                var shelvedAnalysisID = null;
                if (from === to) {
                    shelvedAnalysisID = ui.helper.attr('__shelvedAnalysisID');
                }
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.HELPER_DROPPED, _this, {
                    'analysisID' : ui.helper.attr('__analysisID'),
                    '$helper' : ui.helper,
                    'from' : from,
                    'to' : to
                }));

                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    'shelvedContexts' : _this.getShelvedContexts()
                }));
            },
            over : function(event, ui) {
                ui.helper.attr('__overContainerType', _this._type);
                _this._$ph.attr('__toIndex', '');

                var $cards = _this._$cards;
                _this._$ph.appendTo($cards).css({
                    'width' : ui.helper.outerWidth() + 'px',
                    'height' : ui.helper.outerHeight() + 'px'
                });
                if (_this._layout === 'horizontal') {
                    _this._$ph.addClass('grace-analysis-card_horizontal');
                }
                ui.helper.on('event-drag', function() {
                    var bases = [];
                    var draggingIndex = -1;
                    _this._traversalCards(function(index) {
                        var $card = $(this);
                        if ($card.attr('__dragging') === 'true') {
                            draggingIndex = bases.length;
                        }
                        bases.push({
                            top : $card.offset().top,
                            left : $card.offset().left
                        });
                    }, true, false);

                    var p;
                    if (_this._layout === 'vertical') {
                        p = 'top';
                    } else if (_this._layout === 'horizontal') {
                        p = 'left';
                    }
                    var draggingPosition = ui.helper.offset()[p];
                    for ( i = -1; i < bases.length; i++) {
                        var min = i < 0 ? Number.MIN_VALUE : bases[i][p];
                        var max = i === bases.length - 1 ? Number.MAX_VALUE : bases[i + 1][p];

                        if (draggingPosition > min && draggingPosition <= max) {
                            if (_this._$ph.attr('__toIndex') !== i + 1 + '') {
                                _this._$ph.detach();
                                _this._$ph.attr('__toIndex', i + 1);
                                if (draggingIndex === -1 || (draggingIndex !== i + 1 && draggingIndex !== i )) {
                                    $cards.appendAt(_this._$ph, i + 1);
                                }
                            }
                            break;
                        }
                    }
                }).removeClass('grace-analysis-card_draggingHelper_noDrop').addClass('grace-analysis-card_draggingHelper_grabbing');
            },
            out : function(event, ui) {
                var over = ui.helper.attr('__overContainerType');
                if (_this._type === over) {
                    ui.helper.off('event-drag').addClass('grace-analysis-card_draggingHelper_noDrop').removeClass('grace-analysis-card_draggingHelper_grabbing');
                }

                _this._$ph.detach();
            }
        });
    };
    andrea.blink.extend(ShelfBase, andrea.blink.mvc.View);

    ShelfBase.OPERATION_DISPLAY_SPLITTER = ' | ';

    ShelfBase.prototype.getShelvedContexts = function() {
        var contexts = [];
        this._traversalCards(function(index) {
            var $card = $(this);
            var ctx = {
                'analysisID' : $card.attr('__analysisID'),
                'shelvedAnalysisID' : $card.attr('__shelvedAnalysisID'),
                'operationGroup' : new OperationGroup(JSON.parse($card.attr('__operationIDs'))),
                'filter' : $card.data('__filter')
            };

            contexts.push(ctx);
        }, true, true);
        return contexts;
    };
    ShelfBase.prototype._traversalCards = function(callback, ignorePH, ignoreDragging) {
        var $cards = this._$cards;
        var children = $cards.children();

        var index = 0;
        for (var i = 0; i < children.length; i++) {
            var card = children[i];
            var $card = $(card);

            if (ignorePH && card === this._$ph[0]) {
                continue;
            }
            if (ignoreDragging && $card.attr('__dragging') === 'true') {
                continue;
            }

            callback.call(card, index);
            index++;
        }
    };
    ShelfBase.prototype._setTitle = function(title) {
        var $h2 = $(this._dom).find('h2');
        $h2.text(title);
    };
    ShelfBase.prototype._setRequired = function(required) {
        var $h2 = $(this._dom).find('h2');
        if (required) {
            $h2.addClass('grace-analysis-title-text_required');
        } else {
            $h2.removeClass('grace-analysis-title-text_required');
        }
    };
    ShelfBase.prototype.addSuffix = function(suffix) {
        var $h2 = $(this._dom).find('h2');

        if (suffix) {
            $h2.addClass('grace-analysis-title-text_suffix').attr({
                '__suffix' : suffix
            });
        } else {
            $h2.removeClass('grace-analysis-title-text_suffix');
        }
    };
    ShelfBase.prototype.type = function(value) {
        if (arguments.length > 0) {
            this._type = value;
        } else {
            return this._type;
        }
    };
    ShelfBase.prototype.dropAnalysis = function(a, $helper, from, to) {
        var shelvedAnalysisID, operationIDs;
        if (from === to) {
            shelvedAnalysisID = $helper.attr('__shelvedAnalysisID');
        }
        if ($helper.attr('__operationIDs') && $helper.attr('__shelfType') === this._type) {
            operationIDs = JSON.parse($helper.attr('__operationIDs'));
        }
        var $card = this._addCardAt(a, parseInt(this._$ph.attr('__toIndex')), shelvedAnalysisID, operationIDs);
    };

    ShelfBase.prototype.addCard = function(a, sa) {
        var shelvedAnalysisID, operationIDs;
        if (sa) {
            shelvedAnalysisID = sa.id;
        }
        if (sa && sa.operationGroup) {
            operationIDs = sa.operationGroup.mapIDs();
        }
        var filter;
        if (sa && sa.filter) {
            filter = sa.filter;
        }
        return this._addCardAt(a, -1, shelvedAnalysisID, operationIDs, filter);
    };
    // Override by child class
    ShelfBase.prototype._getOperationInfo = function() {
        return {
            'availableOGs' : [],
            'defaultTypes' : []
        };
    };
    /**
     * @param a Analysis
     * @param index optional int
     */
    ShelfBase.prototype._addCardAt = function(a, index, shelvedAnalysisID, operationIDs, filter) {
        var _this = this;

        var $cards = this._$cards;
        var $card = $('<div/>').addClass(['grace-analysis-card', 'grace-analysis-card-transition'].join(' '));
        if (this._layout === 'horizontal') {
            $card.addClass('grace-analysis-card_horizontal');
        }
        $card.width('');

        $cards.appendAt($card, index);

        var shelvedAnalysisID;
        if (!shelvedAnalysisID) {
            shelvedAnalysisID = _.uniqueId('shelvedAnalysisID_');
        }
        // TODO Use data replace attr
        $card.data({
            '__analysis' : a
        });
        $card.attr({
            '__analysisID' : a.id,
            '__shelvedAnalysisID' : shelvedAnalysisID,
            '__shelfType' : this._type
        });

        var $text = $('<div/>').appendTo($card).addClass('grace-analysis-card-text grace-text-ellipsis').text(a.name);
        // Show title only when ellipsis is actiated
        $text.on('mouseenter', function() {
            var $this = $(this);
            if (this.offsetWidth < this.scrollWidth && !$card.attr('title'))
                $card.attr('title', $this.text());
        }).on('mouseleave', function() {
            $card.attr('title', '');
        });
        // Handler operation
        var info = this._getOperationInfo(a);
        var availableOGs = info.availableOGs;
        var defaultTypes = info.defaultTypes;

        var stopPropagation = function(event) {
            return false;
        };
        var genOperation = function(type, position, title, handlers) {
            var $operation = $('<span/>').appendTo($card);
            $operation.addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
            $operation.addClass(['grace-analysis-card-operation-' + type, 'grace-analysis-card-operation-' + position].join(' '));
            if (title) {
                $operation.attr('title', title);
            }
            $operation.on('click', function(event) {
                if (handlers && handlers.click) {
                    handlers.click(event);
                }
            }).on('mouseenter', function(event) {
                if (handlers && handlers.mouseenter) {
                    handlers.mouseenter(event);
                }
            }).on('mousedown', function(event) {
                event.stopPropagation();
            });
            return $operation;
        };
        var genOperationRemove = function() {
            return genOperation('remove', 1, '移除', {
                'click' : function() {
                    _this._hide($card, function() {
                        $card.detach();
                        _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
                    });
                }
            });
        };
        var $operation;
        if (ShelfType.proc(this._type)) {
            // Proc filter shelf
            // Remove
            genOperationRemove();
            // Filter
            if (filter) {
                $card.data('__filter', filter);
            } else {
                var cValues = this._model().dataProvider.getCValues(a.index, true, false);
                var hasNull = this._model().dataProvider.isCHasNull(a.index);
                if (a.quantifiable) {
                    if (a.valueType() === ValueType.DATE) {
                        $card.data('__filter', new RangeFilter(cValues, hasNull, QuantifiedHelper.TYPE_DATE));
                    } else if (a.valueType() === ValueType.NUMBER) {
                        $card.data('__filter', new RangeFilter(cValues, hasNull, QuantifiedHelper.TYPE_NUMBER));
                    }
                } else {
                    $card.data('__filter', new TextFilter(cValues, hasNull));
                }
            }
            $operation = genOperation('filter', 2, '', {
                'mouseenter' : function(event) {
                    _this._createPopUpFilter(a, $card, $operation);
                }
            });
        } else if (ShelfType.des(this._type)) {
            // Des shelf
            // Remove
            genOperationRemove();
            // Drop down
            if (availableOGs && availableOGs.length > 0) {
                $operation = genOperation('dropDown', 2, '', {
                    'mouseenter' : function(event) {
                        _this._createPopUpMenu(availableOGs, a, $card, $operation);
                    }
                });
            }
        } else if (ShelfType.src(this._type)) {
            // Src shelf
            // Add to analysis
            var copyCard = $.proxy(function(event, pasteTo) {
                if (!pasteTo) {
                    if (this._type === ShelfType.SRC_DIM) {
                        pasteTo = ShelfType.DES_DIM;
                    } else if (this._type === ShelfType.SRC_MEA) {
                        pasteTo = ShelfType.DES_VALUE;
                    }
                }
                this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, this, {
                    'analysis' : $card.data('__analysis'),
                    'pasteTo' : pasteTo
                }));
            }, this);

            $operation = genOperation('addToAnalysis', 1, '分析', {
                'click' : copyCard
            });
            $card.on('dblclick', copyCard);
            // Add to filter
            $operation = genOperation('addToFilter', 2, '过滤', {
                'click' : function(event) {
                    copyCard(event, ShelfType.PROC_FILTER);
                }
            });
            // Hide
            var moveToTrash = $.proxy(function() {
                this._addToTrash($card);
            }, this);
            $operation = genOperation('moveToTrash', 3, '隐藏', {
                'click' : moveToTrash
            });
        }
        if (!operationIDs || operationIDs.length === 0) {
            operationIDs = OperationGroup.createByTypes(defaultTypes).mapIDs();
        }
        if (!operationIDs) {
            operationIDs = [];
        }
        this._setOperations(operationIDs, $card);

        // Complete analysis
        if (ShelfType.src(this._type)) {
            if (this._type === ShelfType.SRC_DIM) {
                a.analysisType = AnalysisType.DIMENSION;
            } else if (this._type === ShelfType.SRC_MEA) {
                a.analysisType = AnalysisType.MEASURE;
            }
        }
        // Add suffix
        if (ShelfType.dim(this._type) && ShelfType.src(this._type)) {
            var suffix;
            if (a.valueType() === ValueType.DATE) {
                suffix = '\uf073';
            } else {
                if (a.numUniqueValue !== null) {
                    suffix = a.numUniqueValue;
                }
            }
            if (suffix) {
                $text.addClass('grace-analysis-card-text_suffix').attr({
                    '__suffix' : suffix
                });
            }
        }
        $card.addClass('grace-analysis-card_asSource');

        // Add card border
        if (a.analysisType === AnalysisType.DIMENSION) {
            $card.addClass('grace-analysis-card_asDimension');
        } else if (a.analysisType === AnalysisType.MEASURE) {
            $card.addClass('grace-analysis-card_asMeasure');
        }

        // Drag
        $card.draggable({
            containment : $('#divDataDiscovery'),
            helper : function(event) {
                var $clone = $(this).clone();
                $clone.width($(this).width()).addClass('grace-analysis-card_draggingHelper');
                $clone.removeClass('grace-analysis-card_asSource grace-analysis-card_asDimension grace-analysis-card_asMeasure');
                $clone.removeClass('grace-analysis-card-transition');
                $clone.appendTo($('body'));
                return $clone;
            },
            start : function(event, ui) {
                $(this).addClass('grace-analysis-card_disabled').attr({
                    '__dragging' : 'true'
                });
                ui.helper.addClass('grace-analysis-card_draggingHelper_grabbing');
            },
            stop : function(event, ui) {
                $(this).removeClass('grace-analysis-card_disabled').attr({
                    '__dragging' : 'false'
                });
                ui.helper.removeClass('grace-analysis-card_draggingHelper_grabbing');

                var from = ui.helper.attr('__shelfType');
                var to = ui.helper.attr('__toContainerType');

                if (to) {
                    if (ShelfType.like(from, to)) {
                        $(this).detach();
                    } else if (ShelfType.des(from) && ShelfType.proc(to)) {
                        $(this).detach();
                    } else if (ShelfType.proc(from) && ShelfType.des(to)) {
                        $(this).detach();
                    }
                } else {
                    if (ShelfType.des(from)) {
                        $(this).detach();
                    }
                }
                // Clear
                ui.helper.off('event-drag');
                //
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    'shelvedContexts' : _this.getShelvedContexts()
                }));
            },
            drag : function(event, ui) {
                ui.helper.trigger('event-drag');
            }
        });
        //
        if (this._animationActivated) {
            $card.width($card.width());
            this._show($card);
        }
        return $card;
    };
    ShelfBase.prototype._addOperation = function(type, $card) {
        var o = OperationFactory.produce(type, OperationPriorityBaseline.USER_SPECIFICATION);

        var og = new OperationGroup(JSON.parse($card.attr('__operationIDs')));
        og.addOperation(o.id);

        this._setOperations(og.mapIDs(), $card);
    };
    ShelfBase.prototype._setOperations = function(operationIDs, $card) {
        var $text = $card.find('.grace-analysis-card-text');

        var operationIDsStringify = JSON.stringify(operationIDs);
        if (operationIDsStringify) {
            var existing = $card.attr('__operationIDs');
            if (!existing) {
                $card.attr({
                    '__operationIDs' : operationIDsStringify
                });
            } else if (existing !== operationIDsStringify) {
                $card.attr({
                    '__shelvedAnalysisID' : _.uniqueId('shelvedAnalysisID_'),
                    '__operationIDs' : operationIDsStringify
                });
            }

            var og = new OperationGroup(operationIDs);
            var abbrs = og.mapAbbrs();
            abbrs = _.without(abbrs, '');
            var abbr = abbrs.join(ShelfBase.OPERATION_DISPLAY_SPLITTER);
            if (abbr && ShelfType.des(this._type)) {
                $text.addClass('grace-analysis-card-text_prefix').attr({
                    '__prefix' : abbr
                });
            } else {
                $text.removeClass('grace-analysis-card-text_prefix');
            }
        } else {
            $card.removeAttr('__operationIDs');
            $text.removeClass('grace-analysis-card-text_prefix');
        }
    };
    ShelfBase.prototype._model = function() {
        return DataDiscoveryModel.instance();
    };
    ShelfBase.prototype._createPopUpFilter = function(a/*Analysis*/, $card, $operation) {
        if (this._popUpFilter) {
            if (this._popUpFilter.$dock() === $operation) {
                return;
            } else {
                this._popUpFilter.closeImmediately();
            }
        }
        var _this = this;
        // Update operation when open
        this._showOperation(true, $card, $operation);
        $card.find('.grace-analysis-card-text').addClass('grace-analysis-card-text-shrink');
        // Update menu when open
        var model = this._model();
        var filterSAs = [];
        var shelvedContexts = this.getShelvedContexts();
        _.each(shelvedContexts, function(ctx) {
            var sa = model.getShelvedAnalysis(ctx.shelvedAnalysisID);
            if (sa.id !== $card.attr('__shelvedAnalysisID')) {
                filterSAs.push(sa);
            }
        });
        var dataProvider = FilterUtil.filter(model.dataProvider, filterSAs);
        var cValues = dataProvider.getCValues(a.index, true, true);
        var hasNull = dataProvider.isCHasNull(a.index);
        if (a.quantifiable) {
            this._popUpFilter = PopUpRangeFilter.create(new RangeValuesProxy($card.data('__filter'), cValues, hasNull));
        } else {
            this._popUpFilter = PopUpTextFilter.create(new TextValuesProxy($card.data('__filter'), cValues, hasNull));
        }
        var renderRequested = false;
        this._popUpFilter.addEventListener(FilterEvent.ITEM_SELECTED, function(event) {
            _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
        });

        this._popUpFilter.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
            // Update operation when close
            this._showOperation(false, $card, $operation);
            $card.find('.grace-analysis-card-text').removeClass('grace-analysis-card-text-shrink');
            // Update operation when close
            _this._popUpFilter.removeAllEventListeners();
            _this._popUpFilter = null;
        }, this);
        this._popUpFilter.open($operation);
    };
    ShelfBase.prototype._showOperation = function(show, $card, $operation) {
        if (show) {
            $card.find('.grace-analysis-card-text').addClass('grace-analysis-card-text-shrink');
            $operation.addClass('grace-analysis-card-operation-show');
        } else {
            $card.find('.grace-analysis-card-text').removeClass('grace-analysis-card-text-shrink');
            $operation.removeClass('grace-analysis-card-operation-show');
        }
    };
    /**
     * Should be overrided
     * @param {Object} $card
     * @param {Object} $operation
     */
    ShelfBase.prototype._createPopUpMenu = function(operationGroups, a/*Analysis*/, $card, $operation) {
        if (this._popUpMenu) {
            return;
        }
        var _this = this;
        // Update operation when open
        this._showOperation(true, $card, $operation);
        // Update menu when open
        this._popUpMenu = PopUpMenu.create(new OperationGroupProxy(operationGroups));
        this._popUpMenu.addEventListener(MenuEvent.ITEM_SELECTED, function(event) {
            var operation = event.data.item;
            _this._addOperation(operation.type, $card);
            // Dispatch CARD_SHELVED to notify visualization update
            _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
        });

        this._popUpMenu.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
            // Update operation when close
            this._showOperation(false, $card, $operation);
            // Update operation when close
            _this._popUpMenu.removeAllEventListeners();
            _this._popUpMenu = null;
        }, this);
        this._popUpMenu.open($operation);
    };
    ShelfBase.prototype.updateShelvedAnalyses = function(getSA) {
        var _this = this;
        var numVisualized = 0;
        // Count number visualized
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr('__shelvedAnalysisID'));
            if (sa && sa.visualized) {
                numVisualized++;
            }
        }, true, true);

        // Update style
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr('__shelvedAnalysisID'));
            // Grey out
            if (sa) {
                if (numVisualized > 0 && !sa.visualized) {
                    $card.addClass('grace-analysis-card_disabled');
                } else {
                    $card.removeClass('grace-analysis-card_disabled');
                }
                // Operation
                _this._setOperations(sa.operationGroup.mapIDs(), $card);
            }
        }, true, true);
    };
    ShelfBase.prototype._addToTrash = function($card) {
        var a = $card.data('__analysis');
        // Model
        var trash = this._$cards.data('__trash') || [];
        if (trash.length === 0) {
            var $trashBin = this._$trashBin;
            var hover = $.proxy(function(event) {
                if (event.type === 'mouseenter' && !this._trashMenu) {
                    var trashMenu = this._trashMenu = PopUpMenu.create(new AnalysesProxy(this._$cards.data('__trash')));
                    trashMenu.addEventListener(MenuEvent.ITEM_SELECTED, function(event) {
                        this._removeFromTrash(event.data.item);
                    }, this);
                    trashMenu.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
                        trashMenu.removeAllEventListeners();
                        this._trashMenu = null;
                    }, this);
                    trashMenu.open($trashBin);
                }
            }, this);
            this._show($trashBin).on('hover', hover);
        }
        trash.push(a);
        this._$cards.data('__trash', trash);
        // View
        this._hide($card, $.proxy(function() {
            $card.detach();
        }, this));
    };
    ShelfBase.prototype._removeFromTrash = function(a) {
        // Model
        var trash = this._$cards.data('__trash') || [];
        trash = _.without(trash, a);
        if (trash.length === 0) {
            this._hide(this._$trashBin).off('hover');
        }
        this._$cards.data('__trash', trash);
        // View
        this._addCardAt(a, 0);
    };
    ShelfBase.prototype._hide = function($target, complete) {
        $target.width($target.width());

        if ($(':visible', $target).length > 0) {
            return $target.show(0).hide('explode', {
                'easing' : 'easeOutSine'
            }, 180, complete);
        } else {
            return $target.hide();
        }
    };
    ShelfBase.prototype._show = function($target, complete) {
        if ($(':visible', $target).length > 0) {
            return $target.hide(0).show('explode', {
                'easing' : 'easeInSine'
            }, 300, complete);
        } else {
            return $target.show();
        }
    };
    ShelfBase.prototype.removeAll = function() {
        this._$cards.empty();
    };
    ShelfBase.prototype._validateSize = function() {
        var size = this.size();

        var h = size.height - 36;
        this._$cards.css({
            'max-height' : h + 'px',
            'height' : h + 'px'
        });
    };
})(jQuery);
