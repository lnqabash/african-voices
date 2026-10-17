using AfricanVoices.API.DTOs;
using FluentValidation;

namespace AfricanVoices.API.Validators;

public class CreateStoryDtoValidator : AbstractValidator<CreateStoryDto>
{
    public CreateStoryDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(300).WithMessage("Title must not exceed 300 characters.");

        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("Language is required.")
            .MaximumLength(100);

        RuleFor(x => x.Region)
            .NotEmpty().WithMessage("Region is required.")
            .MaximumLength(200);

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(2000).When(x => x.Description is not null);

        RuleFor(x => x.ContributorEmail)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.ContributorEmail))
            .WithMessage("Contributor email must be a valid email address.");
    }
}

public class UpdateStoryDtoValidator : AbstractValidator<UpdateStoryDto>
{
    public UpdateStoryDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(300);

        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("Language is required.")
            .MaximumLength(100);

        RuleFor(x => x.Region)
            .NotEmpty().WithMessage("Region is required.")
            .MaximumLength(200);

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100);

        RuleFor(x => x.ContributorEmail)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.ContributorEmail))
            .WithMessage("Contributor email must be a valid email address.");
    }
}
