$(document).ready(function() {
    let currentStep = 1;
    let selectedTheme = null;
    
    // Theme selection
    $('.theme-card').on('click', function() {
        $('.theme-card').removeClass('selected');
        $(this).addClass('selected');
        selectedTheme = $(this).data('theme');
    });
    
    // Theme apply button
    $('.theme-apply-btn').on('click', function(e) {
        e.stopPropagation();
        const themeCard = $(this).closest('.theme-card');
        $('.theme-card').removeClass('selected');
        themeCard.addClass('selected');
        selectedTheme = themeCard.data('theme');
    });
    
    // Next step navigation
    $('.next-step').on('click', function() {
        const stepId = $(this).attr('id');
        
        if (stepId === 'next-step-1') {
            if (!selectedTheme) {
                showNotification('Please select a theme before continuing.', 'warning');
                return;
            }
        } else if (stepId === 'next-step-2') {
            const productType = $('#productType').val().trim();
            if (!productType) {
                showNotification('Please enter a product type before continuing.', 'warning');
                return;
            }
        }
        
        if (currentStep < 3) {
            nextStep();
        }
    });
    
    // Previous step navigation
    $('.prev-step').on('click', function() {
        if (currentStep > 1) {
            prevStep();
        }
    });
    
    // Step indicator clicks
    $('.step-indicator').on('click', function() {
        const targetStep = parseInt($(this).data('step'));
        if (targetStep <= currentStep || canNavigateToStep(targetStep)) {
            goToStep(targetStep);
        }
    });
    
    // Image upload functionality
    $('.image-upload-area').on('click', function() {
        $('#imageUpload').click();
    });
    
    $('#imageUpload').on('change', function() {
        const files = this.files;
        if (files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            $('.upload-text').text(`Selected: ${fileNames}`);
        }
    });
    
    // Drag and drop for image upload
    $('.image-upload-area').on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('drag-over');
    });
    
    $('.image-upload-area').on('dragleave', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
    });
    
    $('.image-upload-area').on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            $('#imageUpload')[0].files = files;
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            $('.upload-text').text(`Selected: ${fileNames}`);
        }
    });
    
    // Price calculations
    $('#netPrice, #discountPercentage').on('input', function() {
        calculateListPrice();
    });
    
    $('#listPrice, #discountPercentage').on('input', function() {
        calculateNetPrice();
    });
    
    // Finish button
    $('#finish-btn').on('click', function() {
        if (validateStep3()) {
            showNotification('Congratulations! You have successfully completed the onboarding process.', 'success');
            // Here you could submit the form data or redirect to the next page
        }
    });
    
    function nextStep() {
        if (currentStep < 3) {
            $(`#step-${currentStep}`).addClass('d-none');
            currentStep++;
            $(`#step-${currentStep}`).removeClass('d-none');
            updateProgressBar();
            updateStepIndicators();
            
            // Add animation
            setTimeout(() => {
                $(`#step-${currentStep}`).addClass('step-active');
            }, 50);
        }
    }
    
    function prevStep() {
        if (currentStep > 1) {
            $(`#step-${currentStep}`).addClass('d-none');
            currentStep--;
            $(`#step-${currentStep}`).removeClass('d-none');
            updateProgressBar();
            updateStepIndicators();
        }
    }
    
    function goToStep(step) {
        $(`#step-${currentStep}`).addClass('d-none');
        currentStep = step;
        $(`#step-${currentStep}`).removeClass('d-none');
        updateProgressBar();
        updateStepIndicators();
    }
    
    function updateProgressBar() {
        const progress = (currentStep / 3) * 100;
        $('.progress-bar').css('width', progress + '%');
    }
    
    function updateStepIndicators() {
        $('.step-indicator').removeClass('active completed');
        
        for (let i = 1; i <= 3; i++) {
            if (i < currentStep) {
                $(`.step-indicator[data-step="${i}"]`).addClass('completed');
            } else if (i === currentStep) {
                $(`.step-indicator[data-step="${i}"]`).addClass('active');
            }
        }
    }
    
    function canNavigateToStep(step) {
        if (step === 2) {
            return selectedTheme !== null;
        } else if (step === 3) {
            return selectedTheme !== null && $('#productType').val().trim() !== '';
        }
        return true;
    }
    
    function validateStep3() {
        const productName = $('#productName').val().trim();
        const netPrice = $('#netPrice').val();
        
        if (!productName) {
            showNotification('Please enter a product name.', 'warning');
            return false;
        }
        
        if (!netPrice || parseFloat(netPrice) <= 0) {
            showNotification('Please enter a valid net price.', 'warning');
            return false;
        }
        
        return true;
    }
    
    function calculateListPrice() {
        const netPrice = parseFloat($('#netPrice').val()) || 0;
        const discountPercentage = parseFloat($('#discountPercentage').val()) || 0;
        
        if (netPrice > 0 && discountPercentage > 0) {
            const listPrice = netPrice / (1 - discountPercentage / 100);
            $('#listPrice').val(listPrice.toFixed(2));
        }
    }
    
    function calculateNetPrice() {
        const listPrice = parseFloat($('#listPrice').val()) || 0;
        const discountPercentage = parseFloat($('#discountPercentage').val()) || 0;
        
        if (listPrice > 0 && discountPercentage > 0) {
            const netPrice = listPrice * (1 - discountPercentage / 100);
            $('#netPrice').val(netPrice.toFixed(2));
        }
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        $('.notification').remove();
        
        const notification = $(`
            <div class="notification alert alert-${type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show" 
                 style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append(notification);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.fadeOut();
        }, 5000);
    }
    
    // Smooth scrolling for step 3
    $('#step-3').on('scroll', function() {
        const scrollTop = $(this).scrollTop();
        const maxScroll = $(this)[0].scrollHeight - $(this).outerHeight();
        const scrollPercentage = (scrollTop / maxScroll) * 100;
        
        // You could add a scroll indicator here if needed
    });
    
    // Form validation on input
    $('.form-control').on('input', function() {
        if ($(this).hasClass('is-invalid')) {
            $(this).removeClass('is-invalid');
        }
    });
    
    // Initialize tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Initialize the first step
    updateProgressBar();
    updateStepIndicators();
});

// Add some CSS for drag over state
const dragOverCSS = `
    .image-upload-area.drag-over {
        border-color: #4f46e5 !important;
        background-color: #f8faff !important;
        transform: scale(1.02);
    }
`;

$('<style>').text(dragOverCSS).appendTo('head');