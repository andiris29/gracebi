(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.supportClasses.ShelfBase");

    var DataType = grace.constants.DataType;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent;
    var Analysis = grace.models.vo.Analysis;
    var ShelfType = grace.constants.ShelfType;
    var OperationMenu = grace.views.popUp.OperationMenu;
    var PopUpEvent = grace.views.popUp.PopUpEvent;
    var OperationFactory = grace.operation.OperationFactory;
    var MenuEvent = grace.views.popUp.MenuEvent;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;
    var OperationType = grace.operation.OperationType;

    var ShelfBase = grace.views.analysisContainer.supportClasses.ShelfBase = function(dom) {
        ShelfBase.superclass.constructor.apply(this, arguments);

        var _this = this;
        // Place holder for card dragging
        this._$ph = $("<div/>").addClass("grace-analysis-card_placeholder");
        //
        this._operationMenu = null;
        /**
         * @protected
         */
        this._type = null;
        this._layout = null;
        this._initialization();

        this.helperGetAnalysis = null;

        $(this._dom).css({
            // "width" : 160 + "px"
        }).addClass("grace-analysis-contaier");

        var $container;
        // Title
        $container = $(this._dom);
        $container = $("<div/>").appendTo($container).addClass("grace-analysis-titleArea grace-analysis-clearfix");
        $container = $("<div/>").appendTo($container).addClass("grace-analysis-title");
        $("<h2/>").appendTo($container).addClass("grace-analysis-title-text");
        $("<a/>").appendTo($container).addClass("grace-analysis-title-icon");

        // Content Cards
        $container = $(this._dom);
        $container = $("<div/>").appendTo($container).addClass("grace-analysis-cardArea");
        var $cards = $("<div/>").appendTo($container).addClass("grace-analysis-cards fancy-scrollbar");
        if (this._layout === "horizontal") {
            $cards.addClass("grace-analysis-cards_noScroll");
        }
        $("<div/>").appendTo($container).addClass("grace-analysis-cardArea-gradientTop");
        $("<div/>").appendTo($container).addClass("grace-analysis-cardArea-gradientBottom");

        //
        $(this._dom).droppable({
            tolerance : 'pointer',
            accept : function(helper) {
                var from = helper.attr("__containerType");
                var to = _this._type;

                var a = _this.helperGetAnalysis(helper.attr("__analysisID"));

                var ACT = ShelfType;
                if (ACT.src(to)) {
                    if (to === ShelfType.SRC_MEA) {
                        if (ACT.src(from) && a.dataType === DataType.NUMBER) {
                            return true;
                        }
                    } else {
                        if (ACT.src(from)) {
                            return true
                        }
                    }
                } else if (ACT.des(to)) {
                    if (to === ShelfType.DES_DIM) {
                        if (a.analysisType === AnalysisType.DIMENSION) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else if (ACT.proc(to)) {
                    return true;
                }
                return false;
            },
            activate : function(event) {
                var helper = $(event.currentTarget);
                var from = helper.attr("__containerType");
                var to = _this._type;

                var ACT = ShelfType;
                if (from !== to && ACT.des(to)) {
                    $(this).addClass("grace-analysis-contaier_dropAcceptable");
                }
            },
            deactivate : function(event) {
                $(this).removeClass("grace-analysis-contaier_dropAcceptable");

                _this._$ph.detach();
            },
            drop : function(event, ui) {
                var from = ui.helper.attr("__containerType");
                var to = _this._type;

                _this._$ph.detach();
                ui.helper.attr("__toContainerType", to);

                var shelvedAnalysisID = null;
                if (from === to) {
                    shelvedAnalysisID = ui.helper.attr("__shelvedAnalysisID");
                }
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.HELPER_DROPPED, _this, {
                    "analysisID" : ui.helper.attr("__analysisID"),
                    "$helper" : ui.helper,
                    "from" : from,
                    "to" : to
                }))

                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    "shelvedContexts" : _this.getShelvedContexts()
                }));            },
            over : function(event, ui) {
                ui.helper.attr("__overContainerType", _this._type);
                _this._$ph.attr("__toIndex", "");

                var $cards = $(_this._dom).find(".grace-analysis-cards");
                _this._$ph.appendTo($cards).css({
                    "width" : ui.helper.outerWidth() + "px",
                    "height" : ui.helper.outerHeight() + "px"
                });
                if (_this._layout === "horizontal") {
                    _this._$ph.addClass("grace-analysis-card_horizontal");
                }
                ui.helper.on("event-drag", function() {
                    var bases = [];
                    var draggingIndex = -1;
                    _this._traversalCards(function(index) {
                        var $card = $(this);
                        if ($card.attr("__dragging") === "true") {
                            draggingIndex = bases.length;
                        }
                        bases.push({
                            top : $card.offset().top,
                            left : $card.offset().left
                        });
                    }, true, false)
                    var p;
                    if (_this._layout === "vertical") {
                        p = "top";
                    } else if (_this._layout === "horizontal") {
                        p = "left"
                    }
                    var draggingPosition = ui.helper.offset()[p];
                    for ( i = -1; i < bases.length; i++) {
                        var min = i < 0 ? Number.MIN_VALUE : bases[i][p];
                        var max = i === bases.length - 1 ? Number.MAX_VALUE : bases[i + 1][p];

                        if (draggingPosition > min && draggingPosition <= max) {
                            if (_this._$ph.attr("__toIndex") !== i + 1 + "") {
                                _this._$ph.detach();
                                _this._$ph.attr("__toIndex", i + 1);
                                if (draggingIndex === -1 || (draggingIndex !== i + 1 && draggingIndex !== i )) {
                                    $cards.appendAt(_this._$ph, i + 1);
                                }
                            }
                            break;
                        }
                    }
                }).removeClass("grace-analysis-card_draggingHelper_noDrop").addClass("grace-analysis-card_draggingHelper_grabbing");
            },
            out : function(event, ui) {
                var over = ui.helper.attr("__overContainerType");
                if (_this._type === over) {
                    ui.helper.off("event-drag").addClass("grace-analysis-card_draggingHelper_noDrop").removeClass("grace-analysis-card_draggingHelper_grabbing");
                }

                _this._$ph.detach();
            }
        });
    };
    andrea.blink.extend(ShelfBase, andrea.blink.mvc.View);

    ShelfBase.OPERATION_DISPLAY_SPLITTER = " | ";

    ShelfBase.prototype.getShelvedContexts = function() {
        var contexts = [];
        this._traversalCards(function(index) {
            var $this = $(this);
            var ctx = {
                "analysisID" : $this.attr("__analysisID"),
                "shelvedAnalysisID" : $this.attr("__shelvedAnalysisID"),
                "operationGroup" : new OperationGroup(JSON.parse($this.attr("__operationIDs")))
            };

            contexts.push(ctx);
        }, true, true);
        return contexts;
    }
    ShelfBase.prototype._traversalCards = function(callback, ignorePH, ignoreDragging) {
        var $cards = $(this._dom).find(".grace-analysis-cards");
        var children = $cards.children();

        var index = 0;
        for (var i = 0; i < children.length; i++) {
            var card = children[i];
            var $card = $(card);

            if (ignorePH && card === this._$ph[0]) {
                continue;
            }
            if (ignoreDragging && $card.attr("__dragging") === "true") {
                continue;
            }

            callback.call(card, index);
            index++;
        }
    }
    ShelfBase.prototype._setTitle = function(title) {
        var $h2 = $(this._dom).find("h2");
        $h2.text(title);
    }
    ShelfBase.prototype._setRequired = function(required) {
        var $h2 = $(this._dom).find("h2");
        if (required) {
            $h2.addClass("grace-analysis-title-text_required");
        } else {
            $h2.removeClass("grace-analysis-title-text_required");
        }
    }
    ShelfBase.prototype.addSuffix = function(suffix) {
        var $h2 = $(this._dom).find("h2");

        if (suffix) {
            $h2.addClass("grace-analysis-title-text_suffix").attr({
                "__suffix" : suffix
            });
        } else {
            $h2.removeClass('grace-analysis-title-text_suffix');
        }
    }
    ShelfBase.prototype.type = function(value) {
        if (arguments.length > 0) {
            this._type = value;
        } else {
            return this._type;
        }
    }
    ShelfBase.prototype.dropAnalysis = function(a, $helper, from, to) {
        var $card = this._addCardAt(a, parseInt(this._$ph.attr("__toIndex")), $helper, from !== to);
    };

    ShelfBase.prototype.addCard = function(a) {
        this._addCardAt(a);
    };
    // Override by child class
    ShelfBase.prototype._getOperationInfo = function() {
        return {
            'availableOGs' : [],
            'defaultTypes' : []        }
    };
    /**
     * @param a Analysis
     * @param index optional int
     * @param $helper optional object
     * @param newShelved optional boolean
     */
    ShelfBase.prototype._addCardAt = function(a, index, $helper, newShelved) {
        var _this = this;

        var $cards = $(this._dom).find(".grace-analysis-cards");
        var $card = $("<div/>").addClass("grace-analysis-card");
        if (this._layout === "horizontal") {
            $card.addClass("grace-analysis-card_horizontal");
        }

        $cards.appendAt($card, index);

        var shelvedAnalysisID;
        if ($helper && !newShelved) {
            shelvedAnalysisID = $helper.attr("__shelvedAnalysisID");
        } else {
            shelvedAnalysisID = _.uniqueId("shelvedAnalysisID_");
        }
        // TODO Use data replace attr
        $card.data({
            '__analysis' : a
        });
        $card.attr({
            "__analysisID" : a.id,
            "__shelvedAnalysisID" : shelvedAnalysisID,
            "__containerType" : this._type
        });

        var $text = $("<div/>").appendTo($card).addClass("grace-analysis-card-text grace-text-ellipsis").text(a.name);
        // Show title only when ellipsis is actiated
        $text.bind('mouseenter', function() {
            var $this = $(this);
            if (this.offsetWidth < this.scrollWidth && !$card.attr('title'))
                $card.attr('title', $this.text());
        });
        // Handler operation
        var $operation;
        var operationIDs;
        if ($helper && $helper.attr("__operationIDs")) {
            operationIDs = JSON.parse($helper.attr("__operationIDs"));
        }
        var info = this._getOperationInfo(a);
        var availableOGs = info.availableOGs;
        var defaultTypes = info.defaultTypes;

        if (ShelfType.des(this._type)) {
            // Add operation drop down for des
            if (availableOGs && availableOGs.length > 0) {
                $operation = $("<span/>").appendTo($card).addClass("grace-analysis-card-operation grace-analysis-card-operation_dropDown");
                $operation.hover(function(event) {
                    _this._createOperationMenu(availableOGs, a, $card, $operation);
                }, null);
            }
        } else if (ShelfType.src(this._type)) {
            // Add operation for src
            $operation = $("<span/>").appendTo($card).addClass("grace-analysis-card-operation grace-analysis-card-operation_add");
            $operation.click(function(event) {
                // var copy = function($card, pasteTo) {
                var pasteTo;
                if (_this._type === ShelfType.SRC_DIM) {
                    pasteTo = ShelfType.DES_DIM;
                } else if (_this._type === ShelfType.SRC_MEA) {
                    pasteTo = ShelfType.DES_VALUE;
                }
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, _this, {
                    'analysis' : $card.data('__analysis'),
                    "pasteTo" : pasteTo
                }));
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
        if (ShelfType.dim(this._type)) {
            var suffix;
            if (a.dataType === DataType.DATE) {
                suffix = '\uf073';
            } else {
                if (a.numUniqueValue !== null) {
                    suffix = a.numUniqueValue;
                }
            }
            if (suffix) {
                $text.addClass("grace-analysis-card-text_suffix").attr({
                    "__suffix" : suffix
                });
            }
        }
        $card.addClass('grace-analysis-card_asSource');

        // Add style when card in des
        if (ShelfType.des(this._type)) {
            if (this._type === ShelfType.DES_DIM) {
                $card.addClass('grace-analysis-card_asDimension');
            } else if (this._type === ShelfType.DES_VALUE) {
                $card.addClass('grace-analysis-card_asMeasure');
            }
        }

        // Drag
        $card.draggable({
            containment : $('#divDataDiscovery'),
            helper : function(event) {
                var $clone = $(this).clone();
                $clone.width($(this).width()).addClass("grace-analysis-card_draggingHelper");
                $clone.removeClass('grace-analysis-card_asSource grace-analysis-card_asDimension grace-analysis-card_asMeasure');
                $clone.appendTo($("body"));
                return $clone;
            },
            start : function(event, ui) {
                $(this).addClass("grace-analysis-card_disabled").attr({
                    "__dragging" : "true"
                });
                ui.helper.addClass("grace-analysis-card_draggingHelper_grabbing");
            },
            stop : function(event, ui) {
                $(this).removeClass("grace-analysis-card_disabled").attr({
                    "__dragging" : "false"
                });
                ui.helper.removeClass("grace-analysis-card_draggingHelper_grabbing");

                var from = ui.helper.attr("__containerType");
                var to = ui.helper.attr("__toContainerType");

                if (to) {
                    if (ShelfType.like(from, to)) {
                        $(this).detach();
                    }
                } else {
                    if (ShelfType.des(from)) {
                        $(this).detach();
                    }
                }
                // Clear
                ui.helper.off("event-drag");
                //
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    "shelvedContexts" : _this.getShelvedContexts()
                }));
            },
            drag : function(event, ui) {
                ui.helper.trigger("event-drag");
            }
        });
        //
        return $card;
    };
    ShelfBase.prototype._addOperation = function(type, $card) {
        var o = OperationFactory.produce(type, OperationPriorityBaseline.USER_SPECIFICATION);

        var og = new OperationGroup(JSON.parse($card.attr("__operationIDs")));
        og.addOperation(o.id);

        this._setOperations(og.mapIDs(), $card);
    };
    ShelfBase.prototype._setOperations = function(operationIDs, $card) {
        var $text = $card.find(".grace-analysis-card-text");

        var operationIDsStringify = JSON.stringify(operationIDs);
        if (operationIDsStringify) {
            if ($card.attr("__operationIDs") !== operationIDsStringify) {
                $card.attr({
                    "__shelvedAnalysisID" : _.uniqueId("shelvedAnalysisID_"),
                    "__operationIDs" : operationIDsStringify
                });
            }

            var og = new OperationGroup(operationIDs);
            var abbrs = og.mapAbbrs();
            abbrs = _.without(abbrs, '');
            var abbr = abbrs.join(ShelfBase.OPERATION_DISPLAY_SPLITTER);
            if (abbr) {
                $text.addClass("grace-analysis-card-text_prefix").attr({
                    "__prefix" : abbr
                });
            } else {
                $text.removeClass("grace-analysis-card-text_prefix");
            }
        } else {
            $card.removeAttr("__operationIDs");
            $text.removeClass("grace-analysis-card-text_prefix");
        }
    }
    /**
     * Should be overrided
     * @param {Object} $card
     * @param {Object} $operation
     */
    ShelfBase.prototype._createOperationMenu = function(operationGroups, a/*Analysis*/, $card, $operation) {
        if (this._operationMenu) {
            return;
        }
        var _this = this;
        // Update operation when open
        $operation.addClass("grace-analysis-card-operation_hover");
        // Update menu when open
        this._operationMenu = OperationMenu.create(operationGroups);
        this._operationMenu.addEventListener(MenuEvent.ITEM_SELECTED, function(event) {
            var operation = event.data.operation;

            if (operation.classification === OperationClassification.CARD_OPERATION) {
                var copy = function($card, pasteTo) {
                    _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, _this, {
                        'analysis' : $card.data('__analysis'),
                        "pasteTo" : pasteTo
                    }));
                }
                if (operation.type === OperationType.CARD_REMOVE) {
                    $card.detach();
                } else if (operation.type === OperationType.CARD_ADD_TO_DIMENSION) {
                    copy($card, ShelfType.DES_DIM)
                } else if (operation.type === OperationType.CARD_ADD_TO_MEASURE) {
                    copy($card, ShelfType.DES_VALUE)
                }
            } else {
                _this._addOperation(operation.type, $card);
            }

            // Dispatch CARD_SHELVED to notify visualization update
            _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
        });

        this._operationMenu.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
            // Update operation when close
            $operation.removeClass("grace-analysis-card-operation_hover");
            // Update operation when close
            _this._operationMenu.removeAllEventListeners();
            _this._operationMenu = null;
        }, this);
        this._operationMenu.open($operation);
    }
    ShelfBase.prototype.updateShelvedAnalyses = function(getSA) {
        var _this = this;
        var numVisualized = 0;
        // Count number visualized
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr("__shelvedAnalysisID"));
            if (sa && sa.visualized) {
                numVisualized++;
            }
        }, true, true);

        // Update style
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr("__shelvedAnalysisID"));
            // Grey out
            if (sa) {
                if (numVisualized > 0 && !sa.visualized) {
                    $card.addClass("grace-analysis-card_disabled");
                } else {
                    $card.removeClass("grace-analysis-card_disabled");
                }
                // Operation
                _this._setOperations(sa.operationGroup.mapIDs(), $card);
            }
        }, true, true);
    }

    ShelfBase.prototype.removeAll = function() {
        var $cards = $(this._dom).find(".grace-analysis-cards");
        $cards.empty();
    }
    ShelfBase.prototype._validateSize = function() {
        var size = this.size();

        var h = size.height - 36;
        var $cards = $(this._dom).find(".grace-analysis-cards");
        $cards.css({
            "max-height" : h + "px",
            "height" : h + "px"
        });
    };
})(jQuery);
