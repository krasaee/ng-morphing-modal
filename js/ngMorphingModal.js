var ngMorphingModal = angular.module('ngMorphingModal', []);

ngMorphingModal.directive('ngMorphingModal', function () {
  return {
    replace: true,
    restrict: 'AE',
    scope: {
      contentSelector: '@',
      selectorId: "@?",
      buttonOpenId: "@",
      buttonCloseId: "@",
      afterOpenFn: '&?',
      afterCloseFn: '&?'
    },
    link: function ($scope, element, attrs) {

      //var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      //var uniqid = randLetter + Date.now();

      var clickCallback = function (event) {

        // if its the close button
        if (event.target.hasAttribute('close-id')) {
          var btn = element.find('[close-id="' + $scope.buttonCloseId + '"]');
          $scope.closeModal(btn);

          if (angular.isDefined(attrs.afterCloseFn)) {
            $scope.afterCloseFn(btn);
          }

          return;
        }

        // if its the open button
        if (event.target.hasAttribute('open-id')) {
          var btn = element.find('[open-id="' + $scope.buttonOpenId + '"]');
          $scope.openModal(btn);

          if (angular.isDefined(attrs.afterOpenFn)) {
            $scope.afterOpenFn(btn);
          }

          return;
        }

        console.log('Invalid callback, no open-id and or close-id defined for this morph modal', element, $scope);
      };

      element.bind('click', clickCallback);
    },
    templateUrl: function (tElement, tAttrs) {
      if (tAttrs.templateUrl != null) {
        return tAttrs.templateUrl;
      }

      return 'ng-morphing-modal.html';
    },
    controller: function ($scope) {

      /**
       * Handle the opening of the modal
       *
       * @param button
       */
      $scope.openModal = function (button) {
        var scaleValue = $scope.retrieveScale(button.next('.cd-modal-bg'));

        button.addClass('to-circle');
        button.next('.cd-modal-bg').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
          $scope.animateLayer(button.next('.cd-modal-bg'), scaleValue, true);
        });

        //if browser doesn't support transitions...
        if (button.parents('.no-csstransitions').length > 0) {
          $scope.animateLayer(button.next('.cd-modal-bg'), scaleValue, true);
        }
      }

      /**
       * Handles the closing of the modal
       *
       * @param contentSelector
       */
      $scope.closeModal = function (button, contentSelector) {
        // TODO should be specific to the selector (of sorts...) - although this probably does not really matter

        var section = $('.cd-section.modal-is-visible');
        section.removeClass('modal-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
          function () {
            $scope.animateLayer(section.find('.cd-modal-bg'), 1, false);


          }
        );

        //if browser doesn't support transitions...
        if (section.parents('.no-csstransitions').length > 0) {
          $scope.animateLayer(section.find('.cd-modal-bg'), 1, false);
        }
      }

      $scope.retrieveScale = function (btn) {
        var that = this;
        if (btn.offset()) {
          var btnRadius = btn.width() / 2,
            left = btn.offset().left + btnRadius,
            top = btn.offset().top + btnRadius - $(window).scrollTop(),
            scale = that.scaleValue(top, left, btnRadius, $(window).height(), $(window).width());

          btn.css('position', 'fixed').velocity({
            top: top - btnRadius,
            left: left - btnRadius,
            translateX: 0
          }, 0);
        } else {
          scale = 1;
        }
        return scale;

      };

      $scope.scaleValue = function (topValue, leftValue, radiusValue, windowW, windowH) {
        var maxDistHor = ( leftValue > windowW / 2) ? leftValue : (windowW - leftValue),
          maxDistVert = ( topValue > windowH / 2) ? topValue : (windowH - topValue);
        return Math.ceil(Math.sqrt(Math.pow(maxDistHor, 2) + Math.pow(maxDistVert, 2)) / radiusValue);
      };

      $scope.animateLayer = function (layer, scaleVal, bool) {

        var that = this;

        layer.velocity({scale: scaleVal}, 400, function () {
          $('body').toggleClass('overflow-hidden', bool);
          (bool)
            ? layer.parents('.cd-section').addClass('modal-is-visible').end().off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend')
            : layer.removeClass('is-visible').removeAttr('style').siblings($scope.selectorId).removeClass('to-circle');
        });
      }

      $scope.updateLayer = function () {

        var that = this;

        var layer = $('.cd-section.modal-is-visible').find('.cd-modal-bg'),
          layerRadius = layer.width() / 2,
          layerTop = layer.siblings('.btn').offset().top + layerRadius - $(window).scrollTop(),
          layerLeft = layer.siblings('.btn').offset().left + layerRadius,
          scale = that.scaleValue(layerTop, layerLeft, layerRadius, $(window).height(), $(window).width());

        layer.velocity({
          top: layerTop - layerRadius,
          left: layerLeft - layerRadius,
          scale: scale
        }, 0);
      }


    }
  }
});